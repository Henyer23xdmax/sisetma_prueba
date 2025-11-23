
import { api } from './api';

export interface DetalleCompraDTO {
    idProducto: number;
    cantidad: number;
    precioUnitario: number; // Costo
    codigoLote: string;
    fechaVencimiento: string;
    precioVenta: number; // Precio venta sugerido para el lote
}

export interface CompraDTO {
    idProveedor: number;
    idTipoComprobante: number;
    serie: string;
    numero: string;
    fecha: string; // YYYY-MM-DD
    detalles: DetalleCompraDTO[];
}

export const purchaseService = {
    create: (compra: CompraDTO) => api.post('/compras', compra),
    getAll: () => api.get('/compras'),
};
