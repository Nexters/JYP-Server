import { AuthVendor } from '../../auth/authVendor';

export interface UserResponse {
  id: string;
  name: string;
  profileImagePath: string;
  personality: string;
}

export interface UserCreateRequest {
  authVendor: AuthVendor;
  authId: string;
  name: string;
  profileImagePath: string;
  personalityId: string;
}

export interface UserUpdateRequest {
  name: string;
  profileImagePath: string;
}
