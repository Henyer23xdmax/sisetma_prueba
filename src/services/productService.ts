
import { api } from './api';
import { Producto, Categoria, Marca, UnidadMedida, Presentacion } from '../types';

export const productService = {
    getAll: () => api.get('/productos'),
    create: (data: Partial<Producto>) => api.post('/productos', data),

    // Maestros
    getCategorias: () => api.get('/categorias'),
    getMarcas: () => api.get('/marcas'),
    getUnidades: () => api.get('/unidades-medida'),
    getPresentaciones: () => api.get('/presentaciones'),
};
