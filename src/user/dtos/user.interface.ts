export interface UserResponse {
  id: string;
  name: string;
  profileImagePath: string;
  personality: string;
}

export interface UserCreateRequest {
  name: string;
  profileImagePath: string;
  personalityId: string;
}

export interface UserUpdateRequest {
  name: string;
  profileImagePath: string;
}
