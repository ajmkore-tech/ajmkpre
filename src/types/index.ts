export interface ExchangeRates {
  bcv: number;
  eur: number;
}
export interface Role {
  id: string;
  name: string;
  modules: {
    inicio: boolean;
    inventario: boolean;
    ventas: boolean;
    clientes: boolean;
    compras: boolean;
    cxc: boolean;
    cxp: boolean;
    configuracion: boolean;
    reportes: boolean;
    [key: string]: boolean;
  };
  permissions: {
    ventas: {
      verPrecioMayorista: boolean;
      editarPrecio: boolean;
      editarTasa: boolean;
    };
    inventario: {
      verCostosUtilidad: boolean;
      editarCostos?: boolean;
    }
  }
}

export type SaleStatus = 'Registrado/Cotizacion' | 'Confirmado' | 'Entregado' | 'Cerrado';

export interface SaleItem {
  codigo: string;
  detalle: string;
  marcaRepuesto?: string;
  marcaVehiculo?: string;
  linea?: string;
  tipoRepuesto?: string;
  proveedor?: string;
  cantidad: number;
  precio: number;
  total: number;
  montoPagado?: number;
  esEmpaque?: boolean;
  empaqueBase?: string;
}

export interface Sale {
  anulado?: boolean;
  anuladoPor?: string;
  id: string;
  fecha: string;
  fechaEstado?: string;
  clienteId: string;
  clienteNombre: string;
  vendedorId?: string;
  estado: SaleStatus;
  tipoUbicacion: 'Local' | 'Externo';
  condicionPago: 'Contado' | 'Crédito';
  tipoDocumento?: 'Nota de Despacho' | 'Factura';
  tipoPrecio: 'Mayorista' | 'Minorista';
  total: number;
  montoPagado?: number;
  items: SaleItem[];
  numeroDocumento?: string;
  numeroControl?: string;
  auditLog?: { date: string; action: string; user?: string }[];
  tasaAplicada?: number;
}

export interface Client {
  tipoCliente?: string;
  id: string;
  razonSocial: string;
  rif: string;
  direccion: string;
  telefono: string;
  correo?: string;
  tipoPrecio: 'Mayorista' | 'Minorista';
  credito: boolean;
  diasCredito: number;
  auditLog?: { date: string; action: string; user?: string }[];
}

export interface Provider {
  id: string;
  tipoProveedor?: 'V' | 'J' | 'G' | 'E';
  razonSocial: string;
  rif: string;
  direccion: string;
  telefono: string;
  email?: string;
  credito?: boolean;
  diasCredito?: number;
}

export interface CostHistory {
  id: string;
  fecha: string;
  costo: number;
  proveedorNombre: string;
  referencia: string;
}

export interface InventoryConfig {
  marcasRepuesto: string[];
  marcasVehiculo: string[];
  lineas: string[];
  tiposRepuesto: string[];
}

export interface Product {
  id?: string;
  codigo: string;
  detalle: string;
  marcaRepuesto: string;
  marcaVehiculo: string;
  linea: string;
  tipoRepuesto: string;
  proveedor: string;
  unidad?: string;
  empaqueBase?: string;
  unidadesPorEmpaque?: number;
  precioEmpaque?: number;
  precioUnidadDetal?: number;
  precioSecundarioMayor?: number;
  precioSecundarioMinor?: number;
  costoEmpaque?: number;
  ventaPorDefecto?: 'UND' | 'EMPAQUE';
  costoPromedio?: number;
  stockDisp: number;
  stockComp?: number;
  stockTrans?: number;
  costoDolar?: number;
  ultimoCosto?: number;
  historialCostos?: CostHistory[];
  precioMayor: number;
  precioMinor: number;
  referencia?: string;
  modelo?: string;
  procedencia?: string;
  codigoBarras?: string;
}

export interface Receipt {
  id: string;
  fecha: string;
  clienteId: string;
  clienteNombre: string;
  monto: number;
  metodoPago: string;
  referencia: string;
  facturasAplicadas: string[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'Efectivo' | 'Transferencia' | 'Zelle' | 'Punto de Venta';
}

export type PurchaseStatus = 'Borrador' | 'En Tránsito' | 'Recibida Parcial' | 'Recibida Total' | 'Anulada';

export interface PaymentRecord {
  fecha: string;
  monto: number;
  metodoPago: string;
  referencia?: string;
  tasa?: number;
  banco?: string;
  id?: string;
}

export interface PurchaseItem {
  codigo: string;
  detalle: string;
  cantidadPedida: number;
  cantidadRecibida: number;
  costoUnitario: number;
  total: number;
  estado?: 'Pendiente' | 'Recibido';
  esCaja?: boolean;
  unidad?: string;
  empaqueBase?: string;
  unidadesPorEmpaque?: number;
  unidadesPorCaja?: number;
  
  costoAntiguo?: number;
  precioMinoristaActual?: number;
  precioMayoristaActual?: number;
  margenAnterior?: number;
  nuevoMargen?: number;
  aplicarNuevoPrecio?: boolean;
  nuevoPrecioMinorista?: number;
  nuevoPrecioMayorista?: number;
}

export interface Purchase {
  id: string;
  fecha: string;
  proveedorId: string;
  proveedorNombre: string;
  numeroFactura?: string;
  condicionPago?: 'Contado' | 'Crédito';
  diasCredito?: number;
  estado: PurchaseStatus;
  total: number;
  items: PurchaseItem[];
  montoPagado: number;
  pagos: PaymentRecord[];
  auditLog?: { date: string; action: string; user?: string }[];
}

export interface Expense {
  id: string;
  fecha: string;
  concepto: string;
  condicionPago?: 'Contado' | 'Crédito';
  proveedorNombre?: string;
  diasCredito?: number;
  categoria: string;
  monto: number;
  estado: 'Pendiente' | 'Pagado' | 'Anulado';
  montoPagado: number;
  pagos: PaymentRecord[];
  auditLog?: { date: string; action: string; user?: string }[];
}

export interface CompanyConfig {
  nombre: string;
  rif: string;
  direccion: string;
  firma: string | null;
  logo: string | null;
  paymentMethods: PaymentMethod[];
  ivaVenta?: number;
  packagingTypes?: string[];
}

export interface SequencesConfig {
  pedido: number;
  notaDespacho: number;
  factura: number;
  secuencia1: number;
  secuencia2: number;
  secuencia3: number;
}

export interface Movement {
  id: string;
  fecha: string;
  codigo: string;
  detalle: string;
  tipo: 'Entrada' | 'Salida';
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
}


