interface UserBase {
  phone: string;
  email: string;
  password: string;
}

export interface User extends UserBase {
  name: string;
  address: string;
  signImg: string;
  citizenshipImg: string;
  isAdmin?: boolean;
  is_verified: boolean;
  is_pending: boolean;
  account_number: string;
  id: string;
  jwt: string;
}

export interface LoginPayload extends UserBase {}

export interface RegistrationPayload extends UserBase {
  name: string;
  signImg: string;
  citizenshipImg: string;
  isAdmin?: boolean;
  phone: string;
  email: string;
  address: string;
  password: string;
}
