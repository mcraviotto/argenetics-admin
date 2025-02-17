import { Client, NewClient } from '@/schemas/clients';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const clientsApi = createApi({
  reducerPath: 'clientsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
    prepareHeaders(headers) {
      const token = Cookies.get('sessionToken')
      if (token) {
        headers.set('authorization', `${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Client'],
  endpoints: (builder) => ({
    listClients: builder.query<Client[], { query: string } | undefined>({
      query: (data) => data?.query ? `/clients?query=${data.query}` : '/clients',
      providesTags: ['Client'],
    }),
    getClient: builder.query<Client, string>({
      query: (id) => `/clients/${id}`,
      providesTags: ['Client'],
    }),
    createClient: builder.mutation<void, Omit<NewClient, "birth_date"> & { birth_date: string }>({
      query: (body) => ({
        url: '/clients',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Client'],
    }),
    deleteClient: builder.mutation<void, string>({
      query: (id) => ({
        url: `/clients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Client'],
    }),
    updateClient: builder.mutation<void, { id: string; data: Omit<NewClient, "birth_date" | "email"> & { birth_date: string } }>({
      query: ({ id, data }) => ({
        url: `/clients/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Client'],
    }),
  }),
})

export const {
  useListClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientsApi
