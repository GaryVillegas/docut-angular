export interface StoreInfo {
  bussinessName: string;
  direction: string;
  categories: string[];
}

export interface UserStoreData {
  userUID: string;
  storeInfo: StoreInfo;
}

export interface ServiceStoreData {
  nombreServicio: string;
  descripcionServicio: string;
  tiempoEstimado: string;
  precio: number;
}

export interface ServiceData {
  storeId: string;
  serviceData: ServiceStoreData;
}
