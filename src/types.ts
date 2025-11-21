
export interface Categoria { id_categoria: number; nombre: string; }
export interface Marca { id_marca: number; nombre: string; descripcion: string; }
export interface UnidadMedida { id_unidad: number; nombre: string; abreviatura: string; }
export interface Presentacion { id_presentacion: number; nombre: string; descripcion: string; }

export interface Cliente {
  id_cliente: number;
  nombre: string;
  apellidos: string;
  nro_documento: string;
  direccion: string;
  celular: string;
}

export interface Proveedor {
  id_proveedor: number;
  razon_social: string;
  ruc: string;
  direccion: string;
  telefono: string;
  correo: string;
}

export interface Producto {
  id_producto: number;
  nombre: string;
  id_categoria: number;
  id_marca: number;
  id_unidad: number;
  id_presentacion: number;
  precio_referencia: number;
  codigo_barras?: string;
}

export interface Lote {
  id_lote: number;
  id_producto: number;
  codigo_lote: string;
  precio_compra: number;
  precio_venta: number;
  fecha_vencimiento: string; // YYYY-MM-DD
  cantidad: number;
}

export interface CartItem {
    product: Producto;
    quantity: number;
    price: number;
}

// --- NUEVAS ENTIDADES MAESTRAS ---

export interface Rol {
    id_rol: number;
    nombre: string;
    descripcion?: string;
}

export interface TipoDocumento {
    id_tipo_documento: number;
    nombre: string;
}

export interface Subcategoria {
    id_subcategoria: number;
    nombre: string;
    id_categoria: number;
}

export interface Usuario {
    id_usuario: number;
    nombre: string;
    apellido: string;
    nombre_usuario: string;
    password?: string;
    id_rol: number;
    correo?: string;
}
