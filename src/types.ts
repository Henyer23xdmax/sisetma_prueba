
// --- ENTIDADES MAESTRAS ---

export interface Categoria {
  idCategoria: number;
  nombre: string;
}

export interface Marca {
  idMarca: number;
  nombre: string;
  descripcion: string;
}

export interface UnidadMedida {
  idUnidad: number;
  nombre: string;
  abreviatura: string;
}

export interface Presentacion {
  idPresentacion: number;
  nombre: string;
  descripcion: string;
}

export interface Subcategoria {
  idSubcategoria: number;
  nombre: string;
  idCategoria: number; // Referencia simple por ahora, o objeto si el backend lo devuelve
}

export interface Rol {
  idRol: number;
  nombre: string;
  descripcion?: string;
}

export interface TipoDocumento {
  idTipoDocumento: number;
  nombre: string;
}

// --- ENTIDADES PRINCIPALES ---

export interface Cliente {
  idCliente: number;
  nombre: string;
  apellidos: string;
  nroDocumento: string;
  direccion: string;
  celular: string;
  estado?: boolean;
}

export interface Proveedor {
  idProveedor: number;
  razonSocial: string;
  ruc: string;
  direccion: string;
  telefono: string;
  correo: string;
}

export interface Producto {
  idProducto: number;
  nombre: string;
  categoria: Categoria;
  marca: Marca;
  unidadMedida: UnidadMedida;
  presentacion: Presentacion;
  precioReferencia: number;
  estado?: boolean;
}

export interface Lote {
  idLote: number;
  producto: Producto; // Objeto anidado
  codigoLote: string;
  precioCompra: number;
  precioVenta: number;
  fechaVencimiento: string;
  cantidad: number;
}

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  password?: string;
  idRol: number;
  correo?: string;
}

// --- DTOs PARA TRANSACCIONES ---

export interface VentaDTO {
  idCliente: number;
  idTipoComprobante: number;
  serie: string;
  productos: DetalleVentaDTO[];
}

export interface DetalleVentaDTO {
  idProducto: number;
  cantidad: number;
}

// --- UI HELPERS ---
export interface CartItem {
  product: Producto;
  quantity: number;
  price: number; // Precio unitario (referencial o del lote)
}
