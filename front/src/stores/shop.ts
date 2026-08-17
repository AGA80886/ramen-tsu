import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

import { api, apiAuth } from '@/services/api'

import type {
  Shop,
  CreateShopData,
  UpdateShopData,
} from '@/types/shop'

function buildShopFormData(
  data: CreateShopData | UpdateShopData,
): FormData {
  const formData = new FormData()

  const appendString = (
    key: string,
    value: string | undefined,
  ) => {
    if (value !== undefined) {
      formData.append(key, value)
    }
  }

  appendString('name', data.name)
  appendString('slug', data.slug)
  appendString(
    'description',
    data.description,
  )
  appendString('address', data.address)
  appendString('city', data.city)
  appendString(
    'district',
    data.district,
  )
  appendString('phone', data.phone)
  appendString('website', data.website)
  appendString(
    'openingHours',
    data.openingHours,
  )

  if (data.images !== undefined) {
    formData.append(
      'images',
      JSON.stringify(data.images),
    )
  }

  if (data.location !== undefined) {
    formData.append(
      'location',
      JSON.stringify(data.location),
    )
  }

  if (data.image) {
    formData.append(
      'image',
      data.image,
    )
  }

  return formData
}

export const useShopStore = defineStore(
  'shop',
  () => {
    const shops = ref<Shop[]>([])
    const myShops = ref<Shop[]>([])
    const currentShop =
      ref<Shop | null>(null)

    const loading = ref(false)
    const error =
      ref<string | null>(null)

    const getShops = async () => {
      loading.value = true
      error.value = null

      try {
        const { data } =
          await api.get('/shop')

        shops.value = data.result
      } catch (err) {
        console.error(
          'getShops error:',
          err,
        )
        error.value =
          '取得店家資料失敗'
      } finally {
        loading.value = false
      }
    }

    const getMyShops = async () => {
      loading.value = true
      error.value = null

      try {
        const { data } =
          await apiAuth.get('/shop/me')

        myShops.value = data.result
      } catch (err) {
        console.error(
          'getMyShops error:',
          err,
        )

        if (axios.isAxiosError(err)) {
          error.value =
            err.response?.data?.message ??
            '取得我的店家失敗'
        } else {
          error.value =
            '取得我的店家失敗'
        }

        throw err
      } finally {
        loading.value = false
      }
    }

    const getMyShopById = async (
      id: string,
    ) => {
      loading.value = true
      error.value = null
      currentShop.value = null

      try {
        const { data } =
          await apiAuth.get(
            `/shop/me/${id}`,
          )

        currentShop.value =
          data.result

        return data.result
      } catch (err) {
        console.error(
          'getMyShopById error:',
          err,
        )

        if (axios.isAxiosError(err)) {
          error.value =
            err.response?.data?.message ??
            '取得店家資料失敗'
        } else {
          error.value =
            '取得店家資料失敗'
        }

        throw err
      } finally {
        loading.value = false
      }
    }

    const getShopBySlug = async (
      slug: string,
    ) => {
      loading.value = true
      error.value = null
      currentShop.value = null

      try {
        const { data } =
          await api.get(
            `/shop/${slug}`,
          )

        currentShop.value =
          data.result
      } catch (err) {
        console.error(
          'getShopBySlug error:',
          err,
        )
        error.value =
          '取得店家資料失敗'
      } finally {
        loading.value = false
      }
    }

    const createShop = async (
      shopData: CreateShopData,
    ) => {
      loading.value = true
      error.value = null

      try {
        const { data } =
          await apiAuth.post(
            '/shop',
            buildShopFormData(
              shopData,
            ),
          )

        myShops.value.unshift(
          data.result,
        )

        return data.result
      } catch (err) {
        console.error(
          'createShop error:',
          err,
        )

        if (axios.isAxiosError(err)) {
          error.value =
            err.response?.data?.message ??
            '新增店家失敗'
        } else {
          error.value =
            '新增店家失敗'
        }

        throw err
      } finally {
        loading.value = false
      }
    }

    const updateShop = async (
      id: string,
      shopData: UpdateShopData,
    ) => {
      loading.value = true
      error.value = null

      try {
        const { data } =
          await apiAuth.patch(
            `/shop/${id}`,
            buildShopFormData(
              shopData,
            ),
          )

        currentShop.value =
          data.result

        const index =
          myShops.value.findIndex(
            shop => shop._id === id,
          )

        if (index !== -1) {
          myShops.value[index] =
            data.result
        }

        return data.result
      } catch (err) {
        console.error(
          'updateShop error:',
          err,
        )

        if (axios.isAxiosError(err)) {
          error.value =
            err.response?.data?.message ??
            '修改店家失敗'
        } else {
          error.value =
            '修改店家失敗'
        }

        throw err
      } finally {
        loading.value = false
      }
    }

    const deleteShop = async (
      id: string,
    ) => {
      loading.value = true
      error.value = null

      try {
        const { data } =
          await apiAuth.delete(
            `/shop/${id}`,
          )

        if (
          currentShop.value?._id === id
        ) {
          currentShop.value = null
        }

        shops.value =
          shops.value.filter(
            shop => shop._id !== id,
          )

        myShops.value =
          myShops.value.filter(
            shop => shop._id !== id,
          )

        return data
      } catch (err) {
        console.error(
          'deleteShop error:',
          err,
        )

        if (axios.isAxiosError(err)) {
          error.value =
            err.response?.data?.message ??
            '刪除店家失敗'
        } else {
          error.value =
            '刪除店家失敗'
        }

        throw err
      } finally {
        loading.value = false
      }
    }

    return {
      shops,
      myShops,
      currentShop,
      loading,
      error,
      getShops,
      getMyShops,
      getMyShopById,
      getShopBySlug,
      createShop,
      updateShop,
      deleteShop,
    }
  },
)
