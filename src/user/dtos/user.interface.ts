export interface User {
  id: string;
  nickname: string;
  profileImagePath: string;
  personality: string;
}

export interface UserUpdate {
  nickname: string;
  profileImagePath: string;
}
