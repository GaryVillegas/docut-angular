export interface UserInfoData {
  name: string;
  lastName: string;
  rut: string;
  tipe: string;
}

export interface UserData {
  UID: string;
  userInfoData: UserInfoData;
}

export interface StoreInfo {
  bussinessName: string;
  direction: string;
  categories: string[];
}

export interface UserStoreData {
  userUID: string;
  storeInfo: StoreInfo;
}
