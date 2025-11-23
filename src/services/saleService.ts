
import { api } from './api';
import { VentaDTO } from '../types';

export const saleService = {
    create: (venta: VentaDTO) => api.post('/ventas', venta),
    getAll: () => api.get('/ventas'),
};
