export interface StoreInfo {
  bussinessName: string;
  direction: string;
  categories: string[];
}

export interface UserStoreData {
  userUID: string;
  storeInfo: StoreInfo;
}

export interface Servicio {
  id: number;
  nombreServicio: string;
  descripcionServicio: string;
  tiempoEstimado: string;
  precio: number;
}
