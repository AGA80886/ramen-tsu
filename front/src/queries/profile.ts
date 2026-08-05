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
 } from '@/types/profile'

const PROFILE_QUERY_KEY = ['profile', 'me'] as const
const STALE_TIME = 1000 * 60 * 5

export const useProfileQuery = defineQuery(() => {
  return useQuery({
    key: PROFILE_QUERY_KEY,

    query: async () => {
      const { data } = await profileService.getProfile()

      return data.result
    },

    staleTime: STALE_TIME,
  })
})

export const useUpdateProfileMutation = defineMutation(() => {
  const user = useUserStore()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (data: UpdateProfilePayload) =>
      profileService.updateProfile(data),

    onSuccess: response => {
      const profile = response.data.result

      user.updateProfile(profile)

      queryCache.setQueryData(
        PROFILE_QUERY_KEY,
        profile,
      )
    },
  })
})

export const useUpdatePasswordMutation = defineMutation(() => {
  return useMutation({
    mutation: (data: UpdatePasswordPayload) =>
      profileService.updatePassword(data),
  })
})

export const useUpdateAvatarMutation = defineMutation(() => {
  const user = useUserStore()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (file: File) =>
      profileService.updateAvatar(file),

    onSuccess: response => {
      const profile = response.data.result

      user.updateProfile(profile)

      queryCache.setQueryData(
        PROFILE_QUERY_KEY,
        profile,
      )
    },
  })
})
