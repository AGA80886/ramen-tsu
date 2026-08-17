export type ShopStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'

export interface ShopOwner {
  _id: string
  account?: string
  nickname?: string
  avatar?: string
}

export interface ShopLocation {
  type: 'Point'
  coordinates: [number, number]
}

export interface Shop {
  _id: string
  name: string
  slug: string
  description: string
  address: string
  city: string
  district: string
  phone?: string
  website?: string
  openingHours?: string
  coverImage?: string
  images: string[]
  location?: ShopLocation
  status: ShopStatus
  createdBy: string | ShopOwner
  createdAt: string
  updatedAt: string
}

export interface CreateShopData {
  name: string
  slug: string
  description: string

  address: string
  city: string
  district: string

  phone?: string
  website?: string
  openingHours?: string

  // Backend / DB 儲存的圖片網址
  coverImage?: string

  // 其他圖片網址
  images?: string[]

  // 之前保留的 GeoJSON，可繼續 optional
  location?: ShopLocation

  // 前端實際準備上傳的圖片檔案
  image?: File
}

export type UpdateShopData =
  Partial<CreateShopData>
