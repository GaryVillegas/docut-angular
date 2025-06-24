export interface storeInfo {
  userUID: string;
  bussinessName: string;
  direction: string;
  categories: string[];
}

export interface storeData {
  storeId: string;
  storeInfo: storeInfo;
}
