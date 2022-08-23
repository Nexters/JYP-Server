import { AuthVendor } from '../auth/authVendor';

export function generateId(authVendor: AuthVendor, authId: string) {
  return `${authVendor}-${authId}`;
}
