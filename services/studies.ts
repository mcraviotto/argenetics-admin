import { api } from '@/api';
import { ListStudiesResponse, ListStudy, NewStudy } from '@/schemas/studies';

export const studiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listStudies: builder.query<ListStudiesResponse, { page?: number, query: string, state?: string, date?: string, medical_institution_id?: string; }>({
      query: ({ page = 1, query, state, date, medical_institution_id }) => `/studies?page=${page}&query=${query}&state=${state}&date=${date}&medical_institution_id=${medical_institution_id}`,
      providesTags: ['Study'],
    }),
    getStudy: builder.query<ListStudy, string>({
      query: (id) => `/studies/${id}`,
      providesTags: ['Study'],
    }),
    downloadStudy: builder.query<{ url: string }, { document_type: string, id: string }>({
      query: ({ document_type, id }) => `/studies/${id}/download_link?document_type=${document_type}`,
    }),
    updateStudy: builder.mutation<ListStudy, Omit<NewStudy, "storage_ref" | "medical_order_ref" | "additional_docs_storage_ref" | "consent_storage_ref" | "clinical_records_storage_ref" | "histopathological_storage_ref"> & { id: string, storage_ref: string, medical_order_ref?: string, additional_docs_storage_ref?: string, consent_storage_ref?: string, clinical_records_storage_ref?: string, histopathological_storage_ref?: string }>({
      query: ({ id, ...body }) => ({
        url: `/studies/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Study'],
    }),
    createStudy: builder.mutation<ListStudy, Omit<NewStudy, "storage_ref" | "medical_order_ref" | "additional_docs_storage_ref" | "consent_storage_ref" | "clinical_records_storage_ref" | "histopathological_storage_ref" | "state"> & { storage_ref: string, medical_order_ref?: string, additional_docs_storage_ref?: string, consent_storage_ref?: string, clinical_records_storage_ref?: string, histopathological_storage_ref?: string }>({
      query: (body) => ({
        url: '/studies',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Study'],
    }),
    requestToDownloadStudy: builder.mutation<void, string>({
      query: (id) => ({
        url: `/studies/${id}/request_download`,
        method: 'POST',
      }),
      invalidatesTags: ['Study'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListStudiesQuery,
  useGetStudyQuery,
  useDownloadStudyQuery,
  useLazyDownloadStudyQuery,
  useUpdateStudyMutation,
  useCreateStudyMutation,
  useLazyGetStudyQuery,
  useRequestToDownloadStudyMutation,
} = studiesApi;
