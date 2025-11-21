
import { Categoria, Marca, UnidadMedida, Presentacion, Producto, Lote, Cliente, Proveedor, Rol, TipoDocumento, Subcategoria, Usuario } from './types';

export const CATEGORIAS_INIT: Categoria[] = [
  { id_categoria: 1, nombre: 'Higiene y Cuidado' },
  { id_categoria: 2, nombre: 'Alimentos' },
  { id_categoria: 3, nombre: 'Bebidas' },
  { id_categoria: 4, nombre: 'Limpieza' },
  { id_categoria: 5, nombre: 'Tecnología' },
];

export const MARCAS_INIT: Marca[] = [
  { id_marca: 1, nombre: 'Gloria', descripcion: 'Lácteos y derivados' },
  { id_marca: 2, nombre: 'Bimbo', descripcion: 'Panificadora' },
  { id_marca: 3, nombre: 'Coca-Cola', descripcion: 'Bebidas gaseosas' },
  { id_marca: 6, nombre: 'Samsung', descripcion: 'Electrónica' },
  { id_marca: 7, nombre: 'Colgate', descripcion: 'Cuidado oral' },
];

export const UNIDADES_INIT: UnidadMedida[] = [
  { id_unidad: 1, nombre: 'Unidad', abreviatura: 'UND' },
  { id_unidad: 2, nombre: 'Kilogramo', abreviatura: 'KG' },
  { id_unidad: 3, nombre: 'Litro', abreviatura: 'LT' },
  { id_unidad: 4, nombre: 'Caja', abreviatura: 'CJA' },
];

export const PRESENTACIONES_INIT: Presentacion[] = [
  { id_presentacion: 1, nombre: 'Botella', descripcion: 'Envase de plástico o vidrio' },
  { id_presentacion: 2, nombre: 'Lata', descripcion: 'Envase metálico' },
  { id_presentacion: 3, nombre: 'Paquete', descripcion: 'Envoltura plástica' },
];

export const PRODUCTOS_INIT: Producto[] = [
  { id_producto: 1, nombre: 'Shampoo Head & Shoulders', id_categoria: 1, id_marca: 7, id_unidad: 1, id_presentacion: 1, precio_referencia: 18.00 },
  { id_producto: 4, nombre: 'Leche Gloria Entera 1L', id_categoria: 2, id_marca: 1, id_unidad: 3, id_presentacion: 2, precio_referencia: 5.50 },
  { id_producto: 5, nombre: 'Pan Bimbo Familiar', id_categoria: 2, id_marca: 2, id_unidad: 1, id_presentacion: 3, precio_referencia: 8.50 },
  { id_producto: 7, nombre: 'Coca-Cola 500ml', id_categoria: 3, id_marca: 3, id_unidad: 1, id_presentacion: 1, precio_referencia: 3.50 },
  { id_producto: 10, nombre: 'Memoria USB 32GB', id_categoria: 5, id_marca: 6, id_unidad: 1, id_presentacion: 3, precio_referencia: 25.00 },
];

export const LOTES_INIT: Lote[] = [
  { id_lote: 1, id_producto: 1, codigo_lote: 'L-001', precio_compra: 12.00, precio_venta: 18.00, fecha_vencimiento: '2025-11-28', cantidad: 48 },
  { id_lote: 4, id_producto: 4, codigo_lote: 'L-004', precio_compra: 3.00, precio_venta: 5.50, fecha_vencimiento: '2025-12-20', cantidad: 60 },
  { id_lote: 5, id_producto: 5, codigo_lote: 'L-005', precio_compra: 5.80, precio_venta: 8.50, fecha_vencimiento: '2025-12-25', cantidad: 36 },
];

export const CLIENTES_INIT: Cliente[] = [
  { id_cliente: 1, nombre: 'Juan', apellidos: 'Pérez Gómez', nro_documento: '12345678', direccion: 'Av. Lima 123', celular: '999888777' },
  { id_cliente: 2, nombre: 'María', apellidos: 'López F.', nro_documento: '98765432', direccion: 'Jr. Cusco 456', celular: '999111222' },
  { id_cliente: 3, nombre: 'Cliente', apellidos: 'General', nro_documento: '00000000', direccion: '-', celular: '-' },
];

export const PROVEEDORES_INIT: Proveedor[] = [
    { id_proveedor: 1, razon_social: 'Distribuidora Norte SAC', ruc: '20100020001', direccion: 'Panamericana Norte Km 5', telefono: '01-555-1234', correo: 'ventas@dinor.com' },
    { id_proveedor: 2, razon_social: 'Importaciones Tech EIRL', ruc: '20555666777', direccion: 'Av. Wilson 123', telefono: '01-444-9876', correo: 'contacto@importh.com' }
];

// --- NUEVOS DATOS INICIALES ---

export const ROLES_INIT: Rol[] = [
    { id_rol: 1, nombre: 'Administrador', descripcion: 'Acceso total' },
    { id_rol: 2, nombre: 'Vendedor', descripcion: 'Acceso a ventas' },
    { id_rol: 3, nombre: 'Almacenero', descripcion: 'Acceso a compras' },
];

export const TIPO_DOC_INIT: TipoDocumento[] = [
    { id_tipo_documento: 1, nombre: 'DNI' },
    { id_tipo_documento: 2, nombre: 'Carnet Extranjería' },
    { id_tipo_documento: 3, nombre: 'RUC' },
];

export const SUBCATEGORIAS_INIT: Subcategoria[] = [
    { id_subcategoria: 1, nombre: 'Corporal', id_categoria: 1 },
    { id_subcategoria: 2, nombre: 'Oral', id_categoria: 1 },
    { id_subcategoria: 6, nombre: 'Conservas', id_categoria: 2 },
    { id_subcategoria: 8, nombre: 'No alcohólicas', id_categoria: 3 },
    { id_subcategoria: 13, nombre: 'Memorias USB', id_categoria: 5 },
];

export const USUARIOS_INIT: Usuario[] = [
    { id_usuario: 1, nombre: 'Admin', apellido: 'General', nombre_usuario: 'admin', password: 'admin', id_rol: 1, correo: 'admin@sistema.com' },
    { id_usuario: 2, nombre: 'Juan', apellido: 'Vendedor', nombre_usuario: 'vendedor', password: '123', id_rol: 2, correo: 'vendedor@sistema.com' },
];
