
import React, { useState } from 'react';
import { Producto, Proveedor, Lote } from '../types';
import GenericModal from '../components/GenericModal';

interface ComprasProps {
    products: Producto[];
    suppliers: Proveedor[];
    onConfirmPurchase: (newBatches: Lote[]) => void;
}

interface PurchaseItem extends Lote {
    nombreProducto: string;
    subtotal: number;
}

const Compras: React.FC<ComprasProps> = ({ products, suppliers, onConfirmPurchase }) => {
    // --- ESTADOS DE CABECERA ---
    const [selectedSupplierId, setSelectedSupplierId] = useState<number>(suppliers[0]?.id_proveedor || 0);
    const [docType, setDocType] = useState("Factura");
    const [docSerie, setDocSerie] = useState("F001");
    const [docNum, setDocNum] = useState("");
    const [docFecha, setDocFecha] = useState(new Date().toISOString().split('T')[0]);

    // --- ESTADOS DE LINEA (DETALLE) ---
    const [tempProductId, setTempProductId] = useState<number>(0);
    const [tempQty, setTempQty] = useState<number>(1);
    const [tempCost, setTempCost] = useState<number>(0);
    const [tempPrice, setTempPrice] = useState<number>(0);
    const [tempBatch, setTempBatch] = useState<string>("");
    const [tempExpiry, setTempExpiry] = useState<string>("");

    // --- ESTADOS DE CARRITO Y MODALES ---
    const [purchaseCart, setPurchaseCart] = useState<PurchaseItem[]>([]);
    const [isSearchProductOpen, setIsSearchProductOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Helpers
    const selectedSupplier = suppliers.find(s => s.id_proveedor === selectedSupplierId);
    const selectedProduct = products.find(p => p.id_producto === tempProductId);
    const filteredProducts = products.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalCompra = purchaseCart.reduce((sum, i) => sum + i.subtotal, 0);

    // --- FUNCIONES ---

    const handleSelectProduct = (prod: Producto) => {
        setTempProductId(prod.id_producto);
        setTempCost(0); // Reset costo
        setTempPrice(prod.precio_referencia || 0);
        setTempBatch(`L-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`); // Sugerir lote
        setIsSearchProductOpen(false);
    };

    const handleAddItem = () => {
        if (!tempProductId || tempQty <= 0 || tempCost <= 0 || !tempBatch) {
            alert("Por favor complete: Producto, Cantidad, Costo y Lote.");
            return;
        }
        
        const prod = products.find(p => p.id_producto === tempProductId);
        if (!prod) return;

        const newItem: PurchaseItem = {
            id_lote: 0, // Temporal
            id_producto: prod.id_producto,
            nombreProducto: prod.nombre,
            codigo_lote: tempBatch,
            precio_compra: tempCost,
            precio_venta: tempPrice,
            fecha_vencimiento: tempExpiry || '2099-12-31',
            cantidad: tempQty,
            subtotal: tempQty * tempCost
        };

        setPurchaseCart([...purchaseCart, newItem]);
        
        // Limpiar campos de línea para el siguiente item
        setTempProductId(0);
        setTempQty(1);
        setTempCost(0);
        setTempPrice(0);
        setTempBatch("");
        setTempExpiry("");
    };

    const handleRemoveItem = (idx: number) => {
        setPurchaseCart(purchaseCart.filter((_, i) => i !== idx));
    };

    const handleSaveCompra = () => {
        if (purchaseCart.length === 0) return;
        if (confirm("¿Confirmar y Guardar Ingreso de Mercadería?")) {
            const newBatches: Lote[] = purchaseCart.map(item => ({
                id_lote: 0,
                id_producto: item.id_producto,
                codigo_lote: item.codigo_lote,
                precio_compra: item.precio_compra,
                precio_venta: item.precio_venta,
                fecha_vencimiento: item.fecha_vencimiento,
                cantidad: item.cantidad
            }));
            onConfirmPurchase(newBatches);
            setPurchaseCart([]);
            alert("Compra registrada exitosamente. Stock actualizado.");
        }
    };

    return (
        <div className="container-fluid p-3 p-md-4" style={{ backgroundColor: '#eef2f7', minHeight: '100%' }}>
            {/* TITULO */}
            <div className="d-flex align-items-center mb-3">
                <div className="bg-primary text-white rounded p-2 me-2"><i className="fas fa-truck-loading"></i></div>
                <h4 className="m-0 fw-bold text-gray-800">Registro de Compras</h4>
            </div>

            {/* BLOQUE SUPERIOR: CABECERA */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-header bg-light fw-bold small text-uppercase text-primary border-bottom-0">
                    <i className="fas fa-file-invoice me-2"></i>Datos del Comprobante
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        {/* Sección Proveedor */}
                        <div className="col-12 col-md-6 border-end-md">
                            <label className="form-label small fw-bold text-muted">Proveedor</label>
                            <div className="input-group mb-2">
                                <select 
                                    className="form-select form-select-sm fw-bold"
                                    value={selectedSupplierId}
                                    onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                                >
                                    {suppliers.map(s => <option key={s.id_proveedor} value={s.id_proveedor}>{s.razon_social}</option>)}
                                </select>
                                <button className="btn btn-outline-secondary btn-sm"><i className="fas fa-search"></i></button>
                            </div>
                            <div className="small text-muted">
                                <strong>RUC:</strong> {selectedSupplier?.ruc || '-'} <span className="mx-2">|</span> 
                                <strong>Dir:</strong> {selectedSupplier?.direccion || '-'}
                            </div>
                        </div>

                        {/* Sección Documento */}
                        <div className="col-12 col-md-6">
                            <div className="row g-2">
                                <div className="col-6 col-md-4">
                                    <label className="form-label small fw-bold text-muted">Tipo Doc.</label>
                                    <select className="form-select form-select-sm" value={docType} onChange={e => setDocType(e.target.value)}>
                                        <option>Factura</option>
                                        <option>Boleta</option>
                                        <option>Guía Remisión</option>
                                    </select>
                                </div>
                                <div className="col-6 col-md-4">
                                    <label className="form-label small fw-bold text-muted">Serie</label>
                                    <input type="text" className="form-control form-control-sm" value={docSerie} onChange={e => setDocSerie(e.target.value)} />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label small fw-bold text-muted">Número</label>
                                    <input type="text" className="form-control form-control-sm" value={docNum} onChange={e => setDocNum(e.target.value)} placeholder="000000" />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">Fecha Emisión</label>
                                    <input type="date" className="form-control form-control-sm" value={docFecha} onChange={e => setDocFecha(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOQUE MEDIO: ENTRADA DE PRODUCTOS */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-body p-3 bg-white rounded">
                    <div className="row g-2 align-items-end">
                        <div className="col-12 col-md-3">
                            <label className="form-label small fw-bold mb-1">Producto</label>
                            <div className="input-group input-group-sm">
                                <input type="text" className="form-control bg-light" readOnly value={selectedProduct?.nombre || ''} placeholder="Seleccione..." />
                                <button className="btn btn-primary" onClick={() => setIsSearchProductOpen(true)}><i className="fas fa-search"></i></button>
                            </div>
                        </div>
                        <div className="col-6 col-md-2">
                             <label className="form-label small fw-bold mb-1">F. Vencimiento</label>
                             <input type="date" className="form-control form-control-sm" value={tempExpiry} onChange={e => setTempExpiry(e.target.value)} />
                        </div>
                        <div className="col-6 col-md-1">
                            <label className="form-label small fw-bold mb-1">Cant.</label>
                            <input type="number" className="form-control form-control-sm" value={tempQty} onChange={e => setTempQty(Number(e.target.value))} min="1" />
                        </div>
                        <div className="col-6 col-md-2">
                            <label className="form-label small fw-bold mb-1">Lote / Serie</label>
                            <input type="text" className="form-control form-control-sm" value={tempBatch} onChange={e => setTempBatch(e.target.value)} />
                        </div>
                        <div className="col-6 col-md-1">
                            <label className="form-label small fw-bold mb-1">P. Compra</label>
                            <input type="number" className="form-control form-control-sm" value={tempCost} onChange={e => setTempCost(Number(e.target.value))} min="0" step="0.1" />
                        </div>
                        <div className="col-6 col-md-1">
                            <label className="form-label small fw-bold mb-1">P. Venta</label>
                            <input type="number" className="form-control form-control-sm" value={tempPrice} onChange={e => setTempPrice(Number(e.target.value))} min="0" step="0.1" />
                        </div>
                        <div className="col-12 col-md-2 d-grid">
                            <button className="btn btn-success btn-sm fw-bold" onClick={handleAddItem}>
                                <i className="fas fa-plus me-1"></i> AÑADIR
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOQUE INFERIOR: TABLA DETALLE */}
            <div className="card shadow border-0" style={{minHeight: '300px'}}>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover mb-0 align-middle table-sm">
                            <thead className="bg-light text-dark text-uppercase small">
                                <tr>
                                    <th className="py-2 ps-3">Producto</th>
                                    <th className="py-2 text-center">Lote</th>
                                    <th className="py-2 text-center">Vencimiento</th>
                                    <th className="py-2 text-center">Cant.</th>
                                    <th className="py-2 text-end">P. Compra</th>
                                    <th className="py-2 text-end">P. Venta</th>
                                    <th className="py-2 text-end">Subtotal</th>
                                    <th className="py-2 text-center" style={{width: '50px'}}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseCart.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5 text-muted">
                                            <i className="fas fa-box-open fa-3x mb-3 opacity-25"></i>
                                            <p className="m-0">No hay items agregados</p>
                                        </td>
                                    </tr>
                                ) : (
                                    purchaseCart.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-3 fw-bold text-primary">{item.nombreProducto}</td>
                                            <td className="text-center small">{item.codigo_lote}</td>
                                            <td className="text-center small">{item.fecha_vencimiento}</td>
                                            <td className="text-center">{item.cantidad}</td>
                                            <td className="text-end">{item.precio_compra.toFixed(2)}</td>
                                            <td className="text-end">{item.precio_venta.toFixed(2)}</td>
                                            <td className="text-end fw-bold">S/. {item.subtotal.toFixed(2)}</td>
                                            <td className="text-center">
                                                <button className="btn btn-link text-danger btn-sm p-0" onClick={() => handleRemoveItem(idx)}>
                                                    <i className="fas fa-times"></i>
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
                            <button className="btn btn-outline-primary shadow-sm" onClick={() => setPurchaseCart([])}>
                                <i className="fas fa-file me-2"></i>Nuevo
                            </button>
                            <button className="btn btn-primary shadow-sm px-4" onClick={handleSaveCompra} disabled={purchaseCart.length === 0}>
                                <i className="fas fa-save me-2"></i>GUARDAR COMPRA
                            </button>
                            <button className="btn btn-outline-danger shadow-sm">
                                <i className="fas fa-door-open me-2"></i>Salir
                            </button>
                        </div>
                        <div className="col-12 col-md-6 text-md-end mt-3 mt-md-0">
                            <span className="text-muted small text-uppercase me-3">Total a Pagar:</span>
                            <span className="h2 fw-bold text-dark m-0">S/. {totalCompra.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL BUSCADOR DE PRODUCTOS */}
            <GenericModal 
                title="Buscar Producto" 
                isOpen={isSearchProductOpen} 
                onClose={() => setIsSearchProductOpen(false)}
                onSave={() => {}} // No action needed on save, selection does action
                size="modal-lg"
            >
                <div className="mb-3">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Escriba nombre del producto..." 
                        autoFocus
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="list-group overflow-auto" style={{maxHeight: '300px'}}>
                    {filteredProducts.map(p => (
                        <button 
                            key={p.id_producto} 
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            onClick={() => handleSelectProduct(p)}
                        >
                            <div>
                                <div className="fw-bold">{p.nombre}</div>
                                <div className="small text-muted">Ref. Venta: S/. {p.precio_referencia.toFixed(2)}</div>
                            </div>
                            <i className="fas fa-chevron-right text-muted"></i>
                        </button>
                    ))}
                </div>
            </GenericModal>
        </div>
    );
};

export default Compras;
