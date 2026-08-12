import {
  defineMutation,
  defineQuery,
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'

import * as profileService from '@/services/profile'
import { useUserStore } from '@/stores/user'
import type {
  UpdateProfilePayload,
  UpdatePasswordPayload,
  VerifyEmailPayload,
} from '@/types/profile'

const STALE_TIME = 1000 * 60 * 5

/**
 * Profile Query Keys
 *
 * Profile 屬於會員私人資料，
 * Query Key 必須包含會員身份，
 * 避免 A 登出、B 登入後讀到 A 的 Profile Cache。
 */
export const profileKeys = {
  all: ['profile'] as const,

  me: (userKey: string) =>
    [
      ...profileKeys.all,
      'me',
      userKey,
    ] as const,
}

/**
 * 取得目前登入會員 Profile
 */
export const useProfileQuery = defineQuery(() => {
  const user = useUserStore()

  return useQuery({
    key: () =>
      profileKeys.me(
        user.account,
      ),

    query: async () => {
      const { data } =
        await profileService.getProfile()

      return data.result
    },

    enabled: () =>
      user.isLoggedIn &&
      Boolean(user.account),

    staleTime: STALE_TIME,
  })
})

/**
 * 修改會員 Profile
 */
export const useUpdateProfileMutation = defineMutation(() => {
  const user = useUserStore()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (data: UpdateProfilePayload) =>
      profileService.updateProfile(data),

    onSuccess: response => {
      const profile = response.data.result

      // 同步 Pinia User Store
      user.updateProfile(profile)

      // 只更新目前會員自己的 Profile Cache
      queryCache.setQueryData(
        profileKeys.me(user.account),
        profile,
      )
    },
  })
})

/**
 * 修改密碼
 */
export const useUpdatePasswordMutation = defineMutation(() => {
  return useMutation({
    mutation: (data: UpdatePasswordPayload) =>
      profileService.updatePassword(data),
  })
})

/**
 * 修改會員頭像
 */
export const useUpdateAvatarMutation = defineMutation(() => {
  const user = useUserStore()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (file: File) =>
      profileService.updateAvatar(file),

    onSuccess: response => {
      const profile = response.data.result

      // 同步 Pinia User Store
      user.updateProfile(profile)

      // 只更新目前會員自己的 Profile Cache
      queryCache.setQueryData(
        profileKeys.me(user.account),
        profile,
      )
    },
  })
})

/**
 * 驗證 Email
 */
export const useVerifyEmailMutation =
  defineMutation(() => {
    return useMutation({
      mutation: (data: VerifyEmailPayload) =>
        profileService.verifyEmail(data),
    })
  })

/**
 * 寄送 Email 驗證信
 */
export const useRequestEmailVerificationMutation =
  defineMutation(() => {
    return useMutation({
      mutation: () =>
        profileService.requestEmailVerification(),
    })
  })
