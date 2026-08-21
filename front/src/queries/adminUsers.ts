import {
  defineMutation,
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'

import * as adminUserService from '@/services/adminUsers'
import type { AdminUserRole } from '@/types/adminUsers'

const STALE_TIME = 1000 * 60 * 5

export const adminUserKeys = {
  root: ['admin-users'] as const,

  list: [
    'admin-users',
    'list',
  ] as const,

  detail: (
    id: string,
  ) =>
    [
      'admin-users',
      'detail',
      id,
    ] as const,
}

export const useAdminUsersQuery =
  () =>
    useQuery({
      key: adminUserKeys.list,

      query: async () => {
        const { data } =
          await adminUserService
            .getAdminUsers()

        return data.result
      },

      staleTime: STALE_TIME,
    })

export const useAdminUserByIdQuery = (
  userId: () => string,
) =>
  useQuery({
    key: () =>
      adminUserKeys.detail(
        userId(),
      ),

    query: async () => {
      const { data } =
        await adminUserService
          .getAdminUserById(
            userId(),
          )

      return data.result
    },

    enabled: () =>
      Boolean(userId()),

    staleTime: STALE_TIME,
  })

export const
  useUpdateAdminUserRoleMutation =
    defineMutation(() => {
      const queryCache =
        useQueryCache()

      return useMutation({
        mutation: async ({
          id,
          role,
        }: {
          id: string
          role: AdminUserRole
        }) => {
          const { data } =
            await adminUserService
              .updateAdminUserRole(
                id,
                {
                  role,
                },
              )

          return data.result
        },

        onSuccess: async user => {
          queryCache.setQueryData(
            adminUserKeys.detail(
              user._id,
            ),
            user,
          )

          await queryCache
            .invalidateQueries({
              key: adminUserKeys.root,
            })
        },
      })
    })
