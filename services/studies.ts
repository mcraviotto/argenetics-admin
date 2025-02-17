import { ClientStudies } from '@/schemas/clients';
import { Study } from '@/schemas/studies';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const studiesApi = createApi({
  reducerPath: 'studiesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
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
    listStudies: builder.query<Study[], void>({
      query: () => '/studies',
    }),
    listClientStudies: builder.query<ClientStudies, string>({
      query: (id) => `/client_studies?client_id=${id}`,
      providesTags: ['Study'],
    }),
    getStudy: builder.query<Study, string>({
      query: (code) => `/studies/${code}`,
    }),
    getClientStudy: builder.query<ClientStudies['data'][0], string>({
      query: (id) => `/client_studies/${id}`,
      providesTags: (result, error, id) => [{ type: 'GetStudy', id }],
    }),
    getClientStudyDownloadLink: builder.query<{ url: string }, string>({
      query: (id) => `/client_studies/${id}/download_link`,
    }),
    deleteClientStudy: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/client_studies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Study'],
    }),
    createStudy: builder.mutation<
      Study,
      { storage_ref: string; study_code: string; client_id: string; metadata: object }
    >({
      query: (body) => ({
        url: '/client_studies',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Study'],
    }),
    updateStudy: builder.mutation<Study, Partial<{ storage_ref: string; study_code: string; client_id: string; metadata: object }> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/client_studies/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'GetStudy', id }],
    }),
    downloadClientStudy: builder.mutation<{ url: string }, string>({
      query: (id) => `/client_studies/${id}/download_link`,
    }),
  }),
});

export const {
  useListStudiesQuery,
  useGetStudyQuery,
  useCreateStudyMutation,
  useListClientStudiesQuery,
  useGetClientStudyQuery,
  useGetClientStudyDownloadLinkQuery,
  useDeleteClientStudyMutation,
  useDownloadClientStudyMutation,
  useUpdateStudyMutation,
} = studiesApi;
