export type UserRole = 'user' | 'admin'

export interface RegisterForm {
  account: string
  password: string
}

export interface LoginForm {
  account: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  account: string
  role: UserRole
  cart: number
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
  confirmPassword: string
}

export interface ValidateResetPasswordTokenPayload {
  token: string
}
