export interface IBillingBillme {
  tipoOperacion: string;
  serie: string;
  correlativo: string;
  fechaEmision: string;
  horaEmision: string;
  fechaVencimiento: string;
  codigoTipoOperacion: string;
  codigoTipoDocumento: string;
  moneda: string;
  montoCredito: number;
  formaPago: string;
  igv: number;
  icbper: number;
  cuotas: ICuota[];
  emisor: ICliente;
  cliente: ICliente;
  totales: ITotales;
  productos: IProducto[];
}

export interface ICliente {
  codigoTipoDocumento: string;
  numDocumento: string;
  razonSocial: string;
  ubigeo: string;
  ciudad: string;
  distrito: string;
  provincia: string;
  direccion: string;
  nombreComercial?: string;
  sucursal?: string;
}

export interface IProducto {
  unidades: number;
  codigoUnidad: string;
  nombre: string;
  moneda: string;
  precioUnitario: number;
  precioLista: number;
  montoSinImpuesto: number;
  montoImpuestos: number;
  montoTotal: number;
  montoIcbper: number;
  factorIcbper: number;
  montoDescuento: number;
  codigoTipoPrecio: string;
  impuestos: IImpuesto[];
  id: string;
  codigoClasificacion: string;
}

export interface IImpuesto {
  monto: number;
  idCategoria: string;
  porcentaje: number;
  codigoAfectacionIgv: string;
  codigoTributo: string;
  nombreTributo: string;
  codigoInterTributo: string;
}

export interface ITotales {
  totalOpExoneradas: number;
  totalOpInafectas: number;
  totalOpGravadas: number;
  totalImpuestos: number;
  totalSinImpuestos: number;
  totalConImpuestos: number;
  totalPagar: number;
  totalDescuentoGlobal: number;
  totalDescuentoProductos: number;
}

export interface ICuota {
  numero: string;
  importe: number;
  fechaVencimiento: string;
}

export interface IBillmeResponse {
  description: string;
  observations: string[];
  faultCode: string;
  faultDescription: string;
  xmlDocument: string;
  cdrBase64: string;
  xmlBase64: string;
}
