
import React, { useState, useEffect } from 'react';
import { Producto, Lote, Cliente, Categoria, Marca, CartItem } from '../types';

interface POSProps {
    products: Producto[];
    lotes: Lote[];
    setLotes: (lotes: Lote[]) => void;
    clients: Cliente[];
    categories: Categoria[];
    brands: Marca[];
}

const POS: React.FC<POSProps> = ({ products, lotes, setLotes, clients, categories, brands }) => {
    // Estado Local
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [catFilter, setCatFilter] = useState<number | null>(null);
    const [selectedClient, setSelectedClient] = useState(clients[0]?.id_cliente || 1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ticketData, setTicketData] = useState<any>(null);
    
    // Estado UI Móvil: 'products' o 'cart'. 
    // Nota: En tablets (md), la UI se vuelve dividida automáticamente.
    const [mobileView, setMobileView] = useState<'products' | 'cart'>('products');

    // Helpers
    const getStockTotal = (id_producto: number) => lotes.filter(l => l.id_producto === id_producto).reduce((sum, l) => sum + l.cantidad, 0);
    
    const getPrecioVenta = (id_producto: number) => {
        const activeBatch = lotes
            .filter(l => l.id_producto === id_producto && l.cantidad > 0)
            .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime())[0];
        return activeBatch ? activeBatch.precio_venta : 0;
    };

    // Filtrado
    const filteredProducts = products.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (catFilter === null || p.id_categoria === catFilter)
    );

    // Acciones Carrito
    const addToCart = (product: Producto) => {
        const stock = getStockTotal(product.id_producto);
        const price = getPrecioVenta(product.id_producto);

        if (stock <= 0) { alert("¡Producto agotado!"); return; }
        if (price <= 0) { alert("Producto sin precio configurado."); return; }

        const existing = cart.find(i => i.product.id_producto === product.id_producto);
        const currentQty = existing ? existing.quantity : 0;
        
        if (currentQty + 1 > stock) { alert("Stock insuficiente."); return; }

        if (existing) {
            setCart(cart.map(i => i.product.id_producto === product.id_producto ? {...i, quantity: i.quantity + 1} : i));
        } else {
            setCart([...cart, { product, quantity: 1, price }]);
        }
    };

    const removeFromCart = (id: number) => setCart(cart.filter(i => i.product.id_producto !== id));
    const updateQty = (id: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.product.id_producto === id) {
                const newQty = item.quantity + delta;
                const stock = getStockTotal(id);
                if (newQty > 0 && newQty <= stock) return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    // Totales
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

    // Procesar Venta
    const handleSale = () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        
        setTimeout(() => {
            const newLotes = [...lotes];
            const saleDetails: any[] = [];
            
            cart.forEach(item => {
                let qtyRemaining = item.quantity;
                // FIFO Logic
                const batches = newLotes
                    .filter(l => l.id_producto === item.product.id_producto && l.cantidad > 0)
                    .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime());
                
                for (let batch of batches) {
                    if (qtyRemaining <= 0) break;
                    const take = Math.min(batch.cantidad, qtyRemaining);
                    const batchIdx = newLotes.findIndex(l => l.id_lote === batch.id_lote);
                    
                    newLotes[batchIdx] = { ...batch, cantidad: batch.cantidad - take };
                    qtyRemaining -= take;
                    saleDetails.push({ producto: item.product.nombre, cantidad: take, subtotal: take * batch.precio_venta });
                }
            });

            setLotes(newLotes);
            setCart([]);
            
            const clientObj = clients.find(c => c.id_cliente === Number(selectedClient));
            setTicketData({
                cliente: clientObj,
                items: saleDetails,
                total: total,
                fecha: new Date().toLocaleString(),
                serie: 'F001',
                numero: Math.floor(Math.random() * 10000) + 2000
            });
            
            setIsProcessing(false);
            const modalElement = document.getElementById('ticketModal');
            if(modalElement) {
                const modal = new (window as any).bootstrap.Modal(modalElement);
                modal.show();
            }
        }, 1000);
    };

    return (
        <div className="container-fluid h-100 p-0 pos-container" style={{ backgroundColor: '#f0f2f5' }}>
            <div className="row g-0 h-100">
                
                {/* ZONA DE PRODUCTOS (IZQUIERDA) */}
                {/* En móvil (<768px) se oculta si mobileView !== 'products'. 
                    En Tablet/Desktop (>=768px) SIEMPRE es visible (d-md-flex) */}
                <div className={`col-12 col-md-7 col-lg-8 d-flex flex-column h-100 ${mobileView === 'products' ? 'd-flex' : 'd-none d-md-flex'}`}>
                    
                    {/* Topbar de Busqueda y Filtros */}
                    <div className="bg-white shadow-sm p-3 z-index-1">
                        <div className="row g-2 align-items-center mb-3">
                            <div className="col">
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text bg-light border-0 text-muted">
                                        <i className="fas fa-search"></i>
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control bg-light border-0 fw-bold fs-6 fs-md-5" 
                                        placeholder="Buscar..."
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Categorias Pills */}
                        <div className="d-flex gap-2 overflow-auto pb-1" style={{scrollbarWidth: 'none'}}>
                            <button 
                                className={`btn rounded-pill px-3 px-md-4 fw-bold ${catFilter === null ? 'btn-dark' : 'btn-light text-secondary'}`}
                                onClick={() => setCatFilter(null)}
                            >
                                Todo
                            </button>
                            {categories.map(c => (
                                <button 
                                    key={c.id_categoria} 
                                    className={`btn rounded-pill px-3 whitespace-nowrap ${catFilter === c.id_categoria ? 'btn-primary' : 'btn-light text-secondary'}`} 
                                    onClick={() => setCatFilter(c.id_categoria)}
                                >
                                    {c.nombre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid de Productos */}
                    <div className="flex-grow-1 overflow-auto p-2 p-md-4">
                        <div className="row g-2 g-md-3">
                            {filteredProducts.map(prod => {
                                const stock = getStockTotal(prod.id_producto);
                                const price = getPrecioVenta(prod.id_producto);
                                return (
                                    <div key={prod.id_producto} className="col-6 col-sm-6 col-md-6 col-lg-4 col-xl-3">
                                        <div 
                                            className="card h-100 border-0 shadow-sm product-card position-relative overflow-hidden"
                                            onClick={() => addToCart(prod)}
                                            style={{ cursor: 'pointer', borderRadius: '0.8rem' }}
                                        >
                                            <div className="position-relative">
                                                <img 
                                                    src={`https://placehold.co/200/e9ecef/secondary?text=${prod.nombre.substring(0,3).toUpperCase()}`} 
                                                    className="card-img-top" 
                                                    alt={prod.nombre}
                                                    style={{ height: '110px', objectFit: 'cover' }}
                                                />
                                                {stock === 0 && (
                                                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center">
                                                        <span className="badge bg-danger fs-6 rotate-n15">AGOTADO</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="card-body p-2 p-md-3 d-flex flex-column">
                                                <div className="mb-auto">
                                                    <h6 className="fw-bold text-dark mb-1 lh-sm text-truncate">{prod.nombre}</h6>
                                                    <small className="text-muted d-block mb-1" style={{fontSize: '0.7rem'}}>{brands.find(m => m.id_marca === prod.id_marca)?.nombre}</small>
                                                </div>
                                                
                                                <div className="mt-2 d-flex justify-content-between align-items-end">
                                                    <span className="fw-bold text-primary">S/. {price.toFixed(2)}</span>
                                                    <button className="btn btn-sm btn-primary rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" style={{width: '28px', height: '28px'}}>
                                                        <i className="fas fa-plus fa-xs"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ZONA DEL CARRITO (DERECHA) */}
                {/* En móvil (<768px) se oculta si mobileView !== 'cart'. 
                    En Tablet/Desktop (>=768px) SIEMPRE es visible (d-md-flex) */}
                <div className={`col-12 col-md-5 col-lg-4 bg-white border-start d-flex flex-column h-100 shadow-lg ${mobileView === 'cart' ? 'd-flex' : 'd-none d-md-flex'}`} style={{ zIndex: 100 }}>
                    
                    {/* Header Carrito */}
                    <div className="p-3 p-md-4 bg-primary text-white">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="m-0 fw-bold"><i className="fas fa-shopping-cart me-2"></i>Venta Actual</h5>
                            <span className="badge bg-white text-primary rounded-pill">{cartCount} items</span>
                        </div>
                        
                        {/* Selector Cliente */}
                        <div className="input-group">
                            <span className="input-group-text bg-primary border-white text-white"><i className="fas fa-user"></i></span>
                            <select 
                                className="form-select bg-primary border-white text-white" 
                                style={{ backgroundImage: 'none' }}
                                value={selectedClient} 
                                onChange={(e) => setSelectedClient(Number(e.target.value))}
                            >
                                {clients.map(c => <option key={c.id_cliente} value={c.id_cliente} className="text-dark">{c.nombre} {c.apellidos}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Lista Items */}
                    <div className="flex-grow-1 overflow-auto p-3">
                        {cart.length === 0 ? (
                            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                                <i className="fas fa-basket-shopping fa-4x mb-3"></i>
                                <p>El carrito está vacío</p>
                            </div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="card mb-2 border-0 shadow-sm bg-light">
                                    <div className="card-body p-2 d-flex align-items-center">
                                        <div className="flex-grow-1">
                                            <div className="fw-bold text-dark lh-1 small text-truncate" style={{maxWidth: '180px'}}>{item.product.nombre}</div>
                                            <div className="text-primary small mt-1">S/. {item.price.toFixed(2)} x {item.quantity}</div>
                                        </div>
                                        <div className="d-flex flex-column align-items-end gap-1">
                                            <div className="fw-bold">S/. {(item.price * item.quantity).toFixed(2)}</div>
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-white border px-2" onClick={() => updateQty(item.product.id_producto, -1)}>-</button>
                                                <button className="btn btn-danger px-2" onClick={() => removeFromCart(item.product.id_producto)}><i className="fas fa-trash-alt"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Totales */}
                    <div className="p-3 p-md-4 bg-light border-top mb-5 mb-md-0"> {/* Margin bottom on mobile for nav */}
                        <div className="d-flex justify-content-between mb-4">
                            <span className="h4 fw-bold text-dark">Total</span>
                            <span className="h3 fw-bold text-primary">S/. {total.toFixed(2)}</span>
                        </div>
                        
                        <button 
                            className="btn btn-primary w-100 py-3 fw-bold shadow text-uppercase fs-5" 
                            disabled={cart.length === 0 || isProcessing} 
                            onClick={handleSale}
                        >
                            {isProcessing ? <><i className="fas fa-spinner fa-spin me-2"></i>...</> : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE BOTTOM NAV - Solo visible en Teléfonos (<768px) via CSS (d-md-none equivalente en media queries del CSS principal) */}
            {/* Nota: El CSS index.html maneja la visibilidad (display:none en >768px) */}
            <div className="mobile-bottom-nav justify-content-around border-top">
                <button 
                    className={`btn flex-grow-1 border-0 rounded-0 ${mobileView === 'products' ? 'text-primary' : 'text-secondary'}`}
                    onClick={() => setMobileView('products')}
                >
                    <div className="d-flex flex-column align-items-center">
                        <i className="fas fa-th-large fs-5 mb-1"></i>
                        <span style={{fontSize: '0.7rem'}}>Productos</span>
                    </div>
                </button>
                <button 
                    className={`btn flex-grow-1 border-0 rounded-0 position-relative ${mobileView === 'cart' ? 'text-primary' : 'text-secondary'}`}
                    onClick={() => setMobileView('cart')}
                >
                    <div className="d-flex flex-column align-items-center">
                        <i className="fas fa-shopping-cart fs-5 mb-1"></i>
                        <span style={{fontSize: '0.7rem'}}>Carrito</span>
                        {cartCount > 0 && (
                            <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>
                                {cartCount}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            {/* Modal Ticket */}
            <div className="modal fade" id="ticketModal" tabIndex={-1}>
                <div className="modal-dialog modal-sm modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg">
                        <div className="modal-header bg-success text-white py-2">
                            <h6 className="modal-title fw-bold small"><i className="fas fa-check-circle me-2"></i>Venta Exitosa</h6>
                            <button type="button" className="btn-close btn-close-white btn-sm" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-3" style={{ fontFamily: 'Courier New' }}>
                            {ticketData && (
                                <div className="text-center">
                                    <div className="fw-bold mb-2">TIENDA DEMO</div>
                                    <div className="small mb-3">{ticketData.fecha}</div>
                                    <div className="border-bottom border-dark border-2 my-2"></div>
                                    <div className="text-start">
                                        {ticketData.items.map((it:any, i:number) => (
                                            <div key={i} className="d-flex justify-content-between small mt-1">
                                                <span>{it.cantidad} x {it.producto.substring(0,10)}</span>
                                                <span>{it.subtotal.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-top border-dark border-2 my-2"></div>
                                    <div className="d-flex justify-content-between fw-bold">
                                        <span>TOTAL:</span>
                                        <span>S/. {ticketData.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POS;
