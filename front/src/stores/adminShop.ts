import { defineStore } from 'pinia'
import {
  computed,
  ref,
} from 'vue'
import axios from 'axios'

import { apiAuth } from '@/services/api'

import type {
  Shop,
  ShopStatus,
} from '@/types/shop'

type ReviewShopStatus = Extract<
  ShopStatus,
  'approved' | 'rejected'
>

export const useAdminShopStore = defineStore(
  'adminShop',
  () => {
    const adminShops = ref<Shop[]>([])

    const loading = ref(false)
    const error = ref<string | null>(null)

    const pendingShops = computed(() => {
      return adminShops.value.filter(
        shop => shop.status === 'pending',
      )
    })

    const getAdminShops = async () => {
      loading.value = true
      error.value = null

      try {
        const { data } = await apiAuth.get(
          '/admin/shop',
        )

        adminShops.value = data.result

        return data.result
      } catch (err) {
        console.error(
          'getAdminShops error:',
          err,
        )

        if (axios.isAxiosError(err)) {
          error.value =
            err.response?.data?.message ??
            '取得店家管理列表失敗'
        } else {
          error.value =
            '取得店家管理列表失敗'
        }

        throw err
      } finally {
        loading.value = false
      }
    }

    const getPendingShops = async () => {
      return getAdminShops()
    }

    const updateShopStatus = async (
      id: string,
      status: ReviewShopStatus,
    ) => {
      loading.value = true
      error.value = null

      try {
        const { data } =
          await apiAuth.patch(
            `/admin/shop/${id}/status`,
            {
              status,
            },
          )

        const index =
          adminShops.value.findIndex(
            shop => shop._id === id,
          )

        if (index !== -1) {
          adminShops.value[index] =
            data.result
        }

        return data.result
      } catch (err) {
        console.error(
          'updateShopStatus error:',
          err,
        )

        if (axios.isAxiosError(err)) {
          error.value =
            err.response?.data?.message ??
            '審核店家失敗'
        } else {
          error.value =
            '審核店家失敗'
        }

        throw err
      } finally {
        loading.value = false
      }
    }

    return {
      adminShops,
      pendingShops,
      loading,
      error,
      getAdminShops,
      getPendingShops,
      updateShopStatus,
    }
  },
)
