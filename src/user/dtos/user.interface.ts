import { AuthVendor } from '../../auth/authVendor';

export interface User {
  id: string;
  nickname: string;
  profileImagePath: string;
  personality: string;
}

export interface UserCreate {
  authVendor: AuthVendor;
  authId: string;
  nickname: string;
  profileImagePath: string;
  personality: string;
}

export interface UserUpdate {
  nickname: string;
  profileImagePath: string;
}
