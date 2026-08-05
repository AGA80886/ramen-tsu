import type { UserRole } from '@/types/auth'

export interface UserProfile {
  _id: string
  account: string
  email: string
  nickname: string
  avatar: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UpdateProfilePayload {
  nickname?: string
  email?: string
}

export interface UpdatePasswordPayload {
  currentPassword: string
  newPassword: string
}
