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

export interface getServiceData {
  documentId: string;
  storeId: string;
  serviceData: ServiceStoreData;
}

// NUEVA INTERFAZ: Todo lo que necesita el componente en una sola estructura
export interface StoreCompleteData {
  storeInfo: UserStoreData;
  storeIds: string[];
  services: ServiceData[];
}
