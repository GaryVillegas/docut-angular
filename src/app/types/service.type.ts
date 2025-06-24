export interface service {
  nombreServicio: string;
  descripcionServicio: string;
  tiempoEstimado: string;
  precio: number;
  storeId: string;
}

export interface serviceData {
  serviceId: string;
  serviceData: service;
}
