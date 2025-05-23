export interface userAuthInfo {
  email: string;
  password: string;
}

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

export interface employee {
  id: string;
  employeeInfo: UserInfoData;
}
