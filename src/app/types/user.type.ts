export interface userAuthInfo {
  email: string;
  password: string;
}

export interface userData {
  UID: string;
  userInfo: userInfo;
}

export interface userInfo {
  name: string;
  lastName: string;
  rut: string;
  tipe: string;
}
