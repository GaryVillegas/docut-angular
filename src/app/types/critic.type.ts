export interface criticInfo {
  nombreCliente: string;
  serviceId: string;
  userUID: string;
  descripcion: string;
  puntuacion: number;
}

export interface criticData {
  crtiticId: string;
  criticInfo: criticInfo;
}
