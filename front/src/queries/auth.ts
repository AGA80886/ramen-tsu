import type { LoginForm, RegisterForm } from '@/types/auth'

import { defineMutation, useMutation } from '@pinia/colada'

import * as auth from '@/services/auth'
import { useUserStore } from '@/stores/user'

export const useRegisterMutation = defineMutation(() =>
  useMutation({
    mutation: (data: RegisterForm) => auth.register(data),
  }),
)

export const useLoginMutation = defineMutation(() => {
  const user = useUserStore()

  return useMutation({
    mutation: (data: LoginForm) => auth.login(data),
    onSuccess: response => {
      user.login(response.data.result)
    },
  })
})

export const useRefreshMutation = defineMutation(() =>
  useMutation({
    mutation: () => auth.refresh(),
  }),
)

export const useLogoutMutation = defineMutation(() => {
  const user = useUserStore()

  return useMutation({
    mutation: () => auth.logout(),
    onSettled: () => {
      user.logout()
    },
  })
})
