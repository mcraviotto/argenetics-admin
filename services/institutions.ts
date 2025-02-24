import { AllInstitutions, ListInstitution, ListInstitutionsResponse, NewInstitution } from '@/schemas/institutions';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const institutionsApi = createApi({
  reducerPath: 'institutionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api`,
    prepareHeaders(headers) {
      const token = Cookies.get('sessionToken');
      if (token) {
        headers.set('authorization', token);
      }
      return headers;
    },
  }),
  tagTypes: ['Institutions'],
  endpoints: (builder) => ({
    listInstitutions: builder.query<ListInstitutionsResponse, { page?: number, query: string, state?: string }>({
      query: ({ query, page = 1, state }) => `/medical_institutions?page=${page}&query=${query}&state=${state}`,
      providesTags: ['Institutions'],
    }),
    getAllInstitutions: builder.query<AllInstitutions, { query?: string }>({
      query: ({ query }) => `/medical_institutions/find_all?query=${query}`,
      providesTags: ['Institutions'],
    }),
    getInstitution: builder.query<ListInstitution, string>({
      query: (id) => `/medical_institutions/${id}`,
      providesTags: ['Institutions'],
    }),
    updateInstitution: builder.mutation<ListInstitution, Omit<NewInstitution, 'password' | 'role'> & { id: string }>({
      query: ({ id, ...data }) => ({
        url: `/medical_institutions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Institutions'],
    }),
    createInstitution: builder.mutation<ListInstitution, Omit<NewInstitution, 'password'>>({
      query: (data) => ({
        url: '/medical_institutions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Institutions'],
    }),
  }),
});

export const {
  useGetAllInstitutionsQuery,
  useListInstitutionsQuery,
  useGetInstitutionQuery,
  useUpdateInstitutionMutation,
  useCreateInstitutionMutation,
} = institutionsApi
