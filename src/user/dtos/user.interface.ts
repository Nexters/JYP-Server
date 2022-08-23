import { AuthVendor } from '../../auth/authVendor';

export interface User {
  id: string;
  name: string;
  profileImagePath: string;
  personality: string;
}

export interface UserCreate {
  authVendor: AuthVendor;
  authId: string;
  name: string;
  profileImagePath: string;
  personalityId: string;
}

export interface UserUpdate {
  name: string;
  profileImagePath: string;
}
