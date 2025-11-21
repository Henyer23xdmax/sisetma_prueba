
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
    const [selectedSupplier, setSelectedSupplier] = useState<number>(suppliers[0]?.id_proveedor || 0);
    const [purchaseCart, setPurchaseCart] = useState<PurchaseItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempItem, setTempItem] = useState<Partial<Lote> & { nombreProducto?: string }>({});

    const filteredProducts = products.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    const initiateAddItem = (product: Producto) => {
        setTempItem({
            id_producto: product.id_producto,
            nombreProducto: product.nombre,
            cantidad: 1,
            precio_compra: 0,
            precio_venta: product.precio_referencia || 0,
            codigo_lote: `L-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            fecha_vencimiento: ''
        });
        setIsModalOpen(true);
    };

    const confirmAddItem = () => {
        if (!tempItem.cantidad || !tempItem.precio_compra || !tempItem.fecha_vencimiento || !tempItem.codigo_lote) {
            alert("Complete todos los campos obligatorios");
            return;
        }
        const newItem: PurchaseItem = {
            id_lote: 0,
            id_producto: tempItem.id_producto!,
            nombreProducto: tempItem.nombreProducto!,
            codigo_lote: tempItem.codigo_lote,
            precio_compra: Number(tempItem.precio_compra),
            precio_venta: Number(tempItem.precio_venta),
            fecha_vencimiento: tempItem.fecha_vencimiento,
            cantidad: Number(tempItem.cantidad),
            subtotal: Number(tempItem.cantidad) * Number(tempItem.precio_compra)
        };
        setPurchaseCart([...purchaseCart, newItem]);
        setIsModalOpen(false);
    };

    const removeItem = (idx: number) => setPurchaseCart(purchaseCart.filter((_, i) => i !== idx));

    const handleFinalizePurchase = () => {
        if (purchaseCart.length === 0) return;
        if (confirm("¿Confirmar ingreso?")) {
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
            alert("Compra registrada.");
        }
    };

    const totalCompra = purchaseCart.reduce((sum, i) => sum + i.subtotal, 0);

    return (
        <div className="container-fluid h-100 p-3 p-md-4" style={{ backgroundColor: '#eef2f7' }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <div>
                    <h3 className="text-dark fw-bold mb-0 fs-4"><i className="fas fa-truck-loading text-primary me-2"></i>Compras</h3>
                    <p className="text-muted mb-0 small">Ingreso de Mercadería</p>
                </div>
                <div className="bg-white p-2 rounded shadow-sm w-100 w-md-auto">
                    <select 
                        className="form-select border-0 bg-light fw-bold w-100" 
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(Number(e.target.value))}
                    >
                        {suppliers.map(s => <option key={s.id_proveedor} value={s.id_proveedor}>{s.razon_social}</option>)}
                    </select>
                </div>
            </div>

            <div className="row g-3 h-100">
                {/* Panel Selección */}
                <div className="col-12 col-md-7 order-2 order-md-1">
                    <div className="card shadow-sm h-100 border-0">
                        <div className="card-header bg-white py-3">
                            <input 
                                type="text" 
                                className="form-control bg-light border-0" 
                                placeholder="Buscar producto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="card-body overflow-auto p-0" style={{maxHeight: '60vh'}}>
                            <table className="table table-hover align-middle mb-0">
                                <tbody className="border-top-0">
                                    {filteredProducts.map(p => (
                                        <tr key={p.id_producto} onClick={() => initiateAddItem(p)} style={{cursor: 'pointer'}}>
                                            <td className="p-3 border-bottom">
                                                <div className="fw-bold text-primary">{p.nombre}</div>
                                                <small className="text-muted">Ref: S/. {p.precio_referencia.toFixed(2)}</small>
                                            </td>
                                            <td className="text-end p-3 border-bottom">
                                                <i className="fas fa-plus-circle text-success fa-lg"></i>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Panel Detalle */}
                <div className="col-12 col-md-5 order-1 order-md-2">
                    <div className="card shadow h-100 border-0">
                        <div className="card-header bg-primary text-white py-2 d-flex justify-content-between align-items-center">
                            <h6 className="m-0 fw-bold">Items</h6>
                            <span className="badge bg-white text-primary">{purchaseCart.length}</span>
                        </div>
                        <div className="card-body overflow-auto bg-light p-2" style={{minHeight: '200px', maxHeight: '50vh'}}>
                            {purchaseCart.map((item, idx) => (
                                <div key={idx} className="card mb-2 border-0 shadow-sm">
                                    <div className="card-body p-2 position-relative">
                                        <button className="btn btn-sm text-danger position-absolute top-0 end-0" onClick={() => removeItem(idx)}><i className="fas fa-times"></i></button>
                                        <div className="fw-bold text-dark pe-4">{item.nombreProducto}</div>
                                        <div className="row g-0 small text-muted mt-1">
                                            <div className="col-6">{item.cantidad} x {item.precio_compra}</div>
                                            <div className="col-6 text-end fw-bold text-primary">S/. {item.subtotal.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="card-footer bg-white p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted">Total</span>
                                <span className="h4 fw-bold text-dark m-0">S/. {totalCompra.toFixed(2)}</span>
                            </div>
                            <button 
                                className="btn btn-success w-100 fw-bold shadow-sm" 
                                disabled={purchaseCart.length === 0}
                                onClick={handleFinalizePurchase}
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <GenericModal 
                title="Nuevo Lote" 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={confirmAddItem}
            >
                <div className="row g-3">
                    <div className="col-6">
                        <label className="form-label fw-bold small">Cant.</label>
                        <input type="number" className="form-control" value={tempItem.cantidad || ''} onChange={e => setTempItem({...tempItem, cantidad: Number(e.target.value)})} />
                    </div>
                    <div className="col-6">
                        <label className="form-label fw-bold small">Costo</label>
                        <input type="number" className="form-control" value={tempItem.precio_compra || ''} onChange={e => setTempItem({...tempItem, precio_compra: Number(e.target.value)})} />
                    </div>
                    <div className="col-6">
                        <label className="form-label fw-bold small">Vence</label>
                        <input type="date" className="form-control" value={tempItem.fecha_vencimiento || ''} onChange={e => setTempItem({...tempItem, fecha_vencimiento: e.target.value})} />
                    </div>
                    <div className="col-6">
                        <label className="form-label fw-bold small">Código</label>
                        <input type="text" className="form-control" value={tempItem.codigo_lote || ''} onChange={e => setTempItem({...tempItem, codigo_lote: e.target.value})} />
                    </div>
                    <div className="col-12">
                        <label className="form-label fw-bold small text-primary">Precio Venta</label>
                        <input type="number" className="form-control border-primary" value={tempItem.precio_venta || ''} onChange={e => setTempItem({...tempItem, precio_venta: Number(e.target.value)})} />
                    </div>
                </div>
            </GenericModal>
        </div>
    );
};

export default Compras;
