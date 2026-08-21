import type {
  LoginForm,
  RegisterForm,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ValidateResetPasswordTokenPayload,
} from '@/types/auth'

import {
  defineMutation,
  useMutation,
  useQueryCache,
} from '@pinia/colada'

import * as auth from '@/services/auth'
import { useUserStore } from '@/stores/user'

export const useRegisterMutation = defineMutation(() =>
  useMutation({
    mutation: (data: RegisterForm) =>
      auth.register(data),
  }),
)

export const useLoginMutation = defineMutation(() => {
  const user = useUserStore()

  return useMutation({
    mutation: (data: LoginForm) =>
      auth.login(data),

    onSuccess: response => {
      user.login(response.data.result)
    },
  })
})

export const useLogoutMutation = defineMutation(() => {
  const user = useUserStore()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: () => auth.logout(),

    onSettled: () => {
      const privateQueryPrefixes = [
        ['article-reactions'],
        ['article', 'mine'],
        ['profile', 'me'],
        ['order', 'mine'],
        ['cart'],
      ]

      for (const key of privateQueryPrefixes) {
        const entries =
          queryCache.getEntries({
            key,
          })

        for (const entry of entries) {
          queryCache.cancel(entry)
          queryCache.remove(entry)
        }
      }

      user.logout()
    },
  })
})

export const useForgotPasswordMutation = defineMutation(() =>
  useMutation({
    mutation: (data: ForgotPasswordPayload) =>
      auth.forgotPassword(data),
  }),
)

export const useResetPasswordMutation = defineMutation(() =>
  useMutation({
    mutation: (data: ResetPasswordPayload) =>
      auth.resetPassword(data),
  }),
)
export const useValidateResetPasswordTokenMutation =
  defineMutation(() =>
    useMutation({
      mutation: (
        data: ValidateResetPasswordTokenPayload,
      ) => auth.validateResetPasswordToken(data),
    }),
  )
