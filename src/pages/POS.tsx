
import React, { useState } from 'react';
import { Producto, Lote, Cliente, Categoria, Marca, CartItem } from '../types';
import GenericModal from '../components/GenericModal';

interface POSProps {
    products: Producto[];
    lotes: Lote[];
    setLotes: (lotes: Lote[]) => void;
    clients: Cliente[];
    categories: Categoria[];
    brands: Marca[];
}

const POS: React.FC<POSProps> = ({ products, lotes, setLotes, clients, categories, brands }) => {
    // --- ESTADOS DE CABECERA ---
    const [selectedClientId, setSelectedClientId] = useState<number>(clients[0]?.id_cliente || 1);
    const [docType, setDocType] = useState("Boleta");
    
    // --- ESTADOS DE LINEA (DETALLE) ---
    const [tempProductId, setTempProductId] = useState<number>(0);
    const [tempQty, setTempQty] = useState<number>(1);
    const [tempStock, setTempStock] = useState<number>(0);
    const [tempPrice, setTempPrice] = useState<number>(0);

    // --- CARRITO Y PROCESAMIENTO ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ticketData, setTicketData] = useState<any>(null);
    
    // --- MODALES ---
    const [isSearchProductOpen, setIsSearchProductOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Helpers
    const selectedClient = clients.find(c => c.id_cliente === selectedClientId);
    const filteredProducts = products.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const selectedProduct = products.find(p => p.id_producto === tempProductId);
    const totalVenta = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const getStockTotal = (id_producto: number) => lotes.filter(l => l.id_producto === id_producto).reduce((sum, l) => sum + l.cantidad, 0);
    
    const getPrecioVenta = (id_producto: number) => {
        const activeBatch = lotes
            .filter(l => l.id_producto === id_producto && l.cantidad > 0)
            .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime())[0];
        return activeBatch ? activeBatch.precio_venta : 0;
    };

    const handleSelectProduct = (prod: Producto) => {
        setTempProductId(prod.id_producto);
        const stock = getStockTotal(prod.id_producto);
        const price = getPrecioVenta(prod.id_producto);
        
        setTempStock(stock);
        setTempPrice(price);
        setTempQty(1);
        
        setIsSearchProductOpen(false);
    };

    const handleAddItem = () => {
        if (!tempProductId) { alert("Seleccione un producto"); return; }
        if (tempQty <= 0) { alert("Cantidad inválida"); return; }
        if (tempQty > tempStock) { alert("Stock insuficiente"); return; }
        if (tempPrice <= 0) { alert("Producto sin precio configurado"); return; }

        const prod = products.find(p => p.id_producto === tempProductId);
        if (!prod) return;

        // Verificar si ya existe en carrito para sumar
        const existingIdx = cart.findIndex(i => i.product.id_producto === tempProductId);
        
        if (existingIdx >= 0) {
            // Actualizar existente
            const newCart = [...cart];
            const currentItem = newCart[existingIdx];
            if (currentItem.quantity + tempQty > tempStock) {
                alert("La cantidad total supera el stock disponible");
                return;
            }
            newCart[existingIdx].quantity += tempQty;
            setCart(newCart);
        } else {
            // Nuevo item
            setCart([...cart, { product: prod, quantity: tempQty, price: tempPrice }]);
        }

        // Resetear línea
        setTempProductId(0);
        setTempQty(1);
        setTempStock(0);
        setTempPrice(0);
    };

    const handleRemoveItem = (id: number) => setCart(cart.filter(i => i.product.id_producto !== id));

    const handleSale = () => {
        if (cart.length === 0) return;
        if (confirm(`¿Procesar venta por S/. ${totalVenta.toFixed(2)}?`)) {
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
                
                setTicketData({
                    cliente: selectedClient,
                    items: saleDetails,
                    total: totalVenta,
                    fecha: new Date().toLocaleString(),
                    serie: 'B001',
                    numero: Math.floor(Math.random() * 10000) + 2000
                });
                
                setIsProcessing(false);
                const modalElement = document.getElementById('ticketModal');
                if(modalElement) {
                    const modal = new (window as any).bootstrap.Modal(modalElement);
                    modal.show();
                }
            }, 1000);
        }
    };

    return (
        <div className="container-fluid p-3 p-md-4" style={{ backgroundColor: '#eef2f7', minHeight: '100%' }}>
            {/* TITULO */}
            <div className="d-flex align-items-center mb-3">
                <div className="bg-success text-white rounded p-2 me-2"><i className="fas fa-cash-register"></i></div>
                <h4 className="m-0 fw-bold text-gray-800">Punto de Venta (POS)</h4>
            </div>

            {/* BLOQUE SUPERIOR: CABECERA */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-header bg-light fw-bold small text-uppercase text-success border-bottom-0">
                    <i className="fas fa-user me-2"></i>Datos del Cliente
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-12 col-md-8 border-end-md">
                            <label className="form-label small fw-bold text-muted">Cliente</label>
                            <div className="input-group">
                                <select 
                                    className="form-select fw-bold"
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(Number(e.target.value))}
                                >
                                    {clients.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellidos}</option>)}
                                </select>
                                <button className="btn btn-outline-secondary"><i className="fas fa-search"></i></button>
                            </div>
                            <div className="small text-muted mt-1">
                                <strong>Doc:</strong> {selectedClient?.nro_documento || '-'} <span className="mx-2">|</span> 
                                <strong>Dir:</strong> {selectedClient?.direccion || '-'}
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                             <label className="form-label small fw-bold text-muted">Comprobante</label>
                             <select className="form-select" value={docType} onChange={e => setDocType(e.target.value)}>
                                 <option>Boleta</option>
                                 <option>Factura</option>
                             </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOQUE MEDIO: ENTRADA DE PRODUCTOS */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-body p-3 bg-white rounded">
                    <div className="row g-2 align-items-end">
                         <div className="col-12 col-md-4">
                            <label className="form-label small fw-bold mb-1">Producto</label>
                            <div className="input-group input-group-sm">
                                <input type="text" className="form-control bg-light" readOnly value={selectedProduct?.nombre || ''} placeholder="Buscar producto..." />
                                <button className="btn btn-primary" onClick={() => setIsSearchProductOpen(true)}><i className="fas fa-search"></i></button>
                            </div>
                        </div>
                        <div className="col-6 col-md-2">
                             <label className="form-label small fw-bold mb-1 text-muted">Stock Disp.</label>
                             <input type="text" className="form-control form-control-sm bg-light" readOnly value={tempStock} />
                        </div>
                        <div className="col-6 col-md-2">
                            <label className="form-label small fw-bold mb-1">Cantidad</label>
                            <input type="number" className="form-control form-control-sm" value={tempQty} onChange={e => setTempQty(Number(e.target.value))} min="1" max={tempStock} />
                        </div>
                        <div className="col-6 col-md-2">
                            <label className="form-label small fw-bold mb-1">P. Unitario</label>
                            <input type="number" className="form-control form-control-sm bg-light" readOnly value={tempPrice.toFixed(2)} />
                        </div>
                        <div className="col-12 col-md-2 d-grid">
                             <button className="btn btn-success btn-sm fw-bold" onClick={handleAddItem}>
                                <i className="fas fa-plus me-1"></i> AGREGAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOQUE INFERIOR: TABLA DETALLE */}
            <div className="card shadow border-0" style={{minHeight: '300px'}}>
                 <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover mb-0 align-middle">
                            <thead className="bg-success text-white text-uppercase small">
                                <tr>
                                    <th className="py-2 ps-3">Descripción del Producto</th>
                                    <th className="py-2 text-center">Cant.</th>
                                    <th className="py-2 text-end">P. Unit.</th>
                                    <th className="py-2 text-end">Importe</th>
                                    <th className="py-2 text-center" style={{width: '50px'}}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-5 text-muted">
                                            <i className="fas fa-shopping-basket fa-3x mb-3 opacity-25"></i>
                                            <p className="m-0">Carrito vacío</p>
                                        </td>
                                    </tr>
                                ) : (
                                    cart.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-3">
                                                <div className="fw-bold text-dark">{item.product.nombre}</div>
                                                <div className="small text-muted">Cod: {item.product.id_producto}</div>
                                            </td>
                                            <td className="text-center fw-bold">{item.quantity}</td>
                                            <td className="text-end">{item.price.toFixed(2)}</td>
                                            <td className="text-end fw-bold text-success">S/. {(item.price * item.quantity).toFixed(2)}</td>
                                            <td className="text-center">
                                                <button className="btn btn-link text-danger btn-sm p-0" onClick={() => handleRemoveItem(item.product.id_producto)}>
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="card-footer bg-white p-3">
                    <div className="row align-items-center">
                        <div className="col-12 col-md-6 d-flex gap-2">
                            <button className="btn btn-outline-secondary shadow-sm" onClick={() => setCart([])}>
                                <i className="fas fa-broom me-2"></i>Limpiar
                            </button>
                        </div>
                        <div className="col-12 col-md-6 text-md-end mt-3 mt-md-0">
                            <div className="d-flex justify-content-end align-items-center gap-3">
                                <div>
                                    <div className="small text-muted text-uppercase text-end">Total Venta</div>
                                    <div className="h2 fw-bold text-primary m-0">S/. {totalVenta.toFixed(2)}</div>
                                </div>
                                <button className="btn btn-primary btn-lg shadow px-4 fw-bold" onClick={handleSale} disabled={cart.length === 0 || isProcessing}>
                                    {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-check me-2"></i>COBRAR</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL BUSQUEDA PRODUCTOS */}
            <GenericModal 
                title="Catálogo de Productos" 
                isOpen={isSearchProductOpen} 
                onClose={() => setIsSearchProductOpen(false)}
                onSave={() => {}}
                size="modal-lg"
            >
                <div className="mb-3">
                    <div className="input-group">
                        <span className="input-group-text bg-white"><i className="fas fa-search"></i></span>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Buscar por nombre o código..." 
                            autoFocus
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="list-group overflow-auto" style={{maxHeight: '350px'}}>
                    {filteredProducts.map(p => {
                         const stock = getStockTotal(p.id_producto);
                         const price = getPrecioVenta(p.id_producto);
                         return (
                            <button 
                                key={p.id_producto} 
                                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${stock === 0 ? 'bg-light text-muted' : ''}`}
                                onClick={() => { if(stock > 0) handleSelectProduct(p); }}
                                disabled={stock === 0}
                            >
                                <div>
                                    <div className="fw-bold">{p.nombre}</div>
                                    <div className="small">
                                        Marca: {brands.find(b => b.id_marca === p.id_marca)?.nombre} | 
                                        Cat: {categories.find(c => c.id_categoria === p.id_categoria)?.nombre}
                                    </div>
                                </div>
                                <div className="text-end">
                                    <div className={`fw-bold ${stock > 0 ? 'text-success' : 'text-danger'}`}>
                                        {stock > 0 ? `Stock: ${stock}` : 'AGOTADO'}
                                    </div>
                                    <div className="small text-primary fw-bold">S/. {price.toFixed(2)}</div>
                                </div>
                            </button>
                         );
                    })}
                </div>
            </GenericModal>
            
            {/* Modal Ticket (Mismo del anterior, oculto por defecto) */}
            <div className="modal fade" id="ticketModal" tabIndex={-1}>
                <div className="modal-dialog modal-sm modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg">
                        <div className="modal-header bg-dark text-white py-2">
                            <h6 className="modal-title fw-bold small"><i className="fas fa-print me-2"></i>Imprimiendo...</h6>
                            <button type="button" className="btn-close btn-close-white btn-sm" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-3" style={{ fontFamily: 'Courier New' }}>
                            {ticketData && (
                                <div className="text-center">
                                    <div className="fw-bold mb-2">TIENDA DEMO</div>
                                    <div className="small mb-1">RUC: 20100020001</div>
                                    <div className="small mb-3">{ticketData.fecha}</div>
                                    <div className="text-start small mb-2">CLIE: {ticketData.cliente?.nombre}</div>
                                    <div className="border-bottom border-dark border-2 my-2"></div>
                                    <div className="text-start">
                                        {ticketData.items.map((it:any, i:number) => (
                                            <div key={i} className="d-flex justify-content-between small mt-1">
                                                <span>{it.cantidad} x {it.producto.substring(0,12)}</span>
                                                <span>{it.subtotal.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-top border-dark border-2 my-2"></div>
                                    <div className="d-flex justify-content-between fw-bold fs-5">
                                        <span>TOTAL:</span>
                                        <span>S/. {ticketData.total.toFixed(2)}</span>
                                    </div>
                                    <div className="mt-4 text-center small">¡Gracias por su compra!</div>
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
