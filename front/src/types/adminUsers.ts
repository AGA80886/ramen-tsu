export type AdminUserRole = 'user' | 'admin'

export interface IAdminUser {
  _id: string
  account: string
  email: string
  emailVerified: boolean
  emailVerifiedAt: string | null
  nickname: string
  avatar: string
  role: AdminUserRole
  createdAt: string
  updatedAt: string
}

export interface UpdateAdminUserRoleBody {
  role: AdminUserRole
}
