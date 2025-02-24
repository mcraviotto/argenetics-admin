import { ListStudiesResponse, ListStudy, NewStudy } from '@/schemas/studies';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const studiesApi = createApi({
  reducerPath: 'studiesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api`,
    prepareHeaders(headers) {
      const token = Cookies.get('sessionToken');
      if (token) {
        headers.set('authorization', `${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Study', 'GetStudy'],
  endpoints: (builder) => ({
    listStudies: builder.query<ListStudiesResponse, { page?: number, query: string, state?: string, date?: string }>({
      query: ({ page = 1, query, state, date }) => `/studies?page=${page}&query=${query}&state=${state}&date=${date}`,
      providesTags: ['Study'],
    }),
    getStudy: builder.query<ListStudy, string>({
      query: (id) => `/studies/${id}`,
      providesTags: ['Study'],
    }),
    downloadStudy: builder.query<{ url: string }, { document_type: string, id: string }>({
      query: ({ document_type, id }) => `/studies/${id}/download_link?document_type=${document_type}`,
    }),
    updateStudy: builder.mutation<ListStudy, Omit<NewStudy, "storage_ref" | "medical_order_ref" | "additional_docs_storage_ref"> & { id: string, storage_ref: string, medical_order_ref?: string, additional_docs_storage_ref?: string }>({
      query: ({ id, ...body }) => ({
        url: `/studies/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Study'],
    }),
    createStudy: builder.mutation<ListStudy, Omit<NewStudy, "storage_ref" | "medical_order_ref" | "additional_docs_storage_ref" | "state"> & { storage_ref: string, medical_order_ref?: string, additional_docs_storage_ref?: string }>({
      query: (body) => ({
        url: '/studies',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Study'],
    }),
  }),
});

export const {
  useListStudiesQuery,
  useGetStudyQuery,
  useDownloadStudyQuery,
  useLazyDownloadStudyQuery,
  useUpdateStudyMutation,
  useCreateStudyMutation,
} = studiesApi;
