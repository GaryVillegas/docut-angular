export interface storeInfo {
  userUID: string;
  bussinessName: string;
  direction: string;
  categories: string[];
}

export interface storeStatus {
  statusCondition: boolean;
}

export interface storeData {
  storeId: string;
  storeInfo: storeInfo;
  storeStatus: storeStatus;
}
