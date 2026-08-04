import type {
  LoginResponse,
  UserRole,
} from '@/types/auth'
import type { UserProfile } from '@/types/profile'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const accessToken = ref('')
  const account = ref('')
  const email = ref('')
  const nickname = ref('')
  const avatar = ref('')
  const role = ref<UserRole>('user')
  const cart = ref(0)

  const isLoggedIn = computed(() => {
    return accessToken.value.length > 0
  })

  const isAdmin = computed(() => {
    return role.value === 'admin'
  })

  function login(data: LoginResponse): void {
    accessToken.value = data.accessToken
    account.value = data.account
    role.value = data.role
    cart.value = data.cart
  }

  function updateProfile(profile: UserProfile): void {
    account.value = profile.account
    email.value = profile.email
    nickname.value = profile.nickname
    avatar.value = profile.avatar
    role.value = profile.role
  }

  function logout(): void {
    accessToken.value = ''
    account.value = ''
    email.value = ''
    nickname.value = ''
    avatar.value = ''
    role.value = 'user'
    cart.value = 0
  }

  return {
    accessToken,
    account,
    email,
    nickname,
    avatar,
    role,
    cart,

    isLoggedIn,
    isAdmin,

    login,
    updateProfile,
    logout,
  }
})
