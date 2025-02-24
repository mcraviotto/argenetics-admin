import { ListPatient, ListPatientsResponse, NewPatient } from '@/schemas/patients';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const patientsApi = createApi({
  reducerPath: 'patientsApi',
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
  tagTypes: ['Patients'],
  endpoints: (builder) => ({
    listPatients: builder.query<ListPatientsResponse, { page?: number, query: string, state?: string, medical_institution_id?: string }>({
      query: ({ page = 1, query, state, medical_institution_id }) => `/patients?page=${page}&query=${query}&state=${state}&medical_institution_id=${medical_institution_id}`,
      providesTags: ['Patients'],
    }),
    getPatient: builder.query<ListPatient, string>({
      query: (id) => `/patients/${id}`,
      providesTags: ['Patients'],
    }),
    getAllPatients: builder.query<{ id: string, name: string }[], void>({
      query: () => '/patients/find_all',
      providesTags: ['Patients'],
    }),
    updatePatient: builder.mutation<ListPatient, Partial<Omit<NewPatient, 'role' | 'password' | 'birth_date'> & { id: string, birth_date: string }>>({
      query: ({ id, ...data }) => ({
        url: `/patients/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Patients'],
    }),
    createPatient: builder.mutation<ListPatient, Omit<NewPatient, 'birth_date' | 'password'> & { birth_date: string }>({
      query: (data) => ({
        url: '/patients',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Patients'],
    }),
  }),
});

export const {
  useListPatientsQuery,
  useGetPatientQuery,
  useUpdatePatientMutation,
  useCreatePatientMutation,
  useGetAllPatientsQuery
} = patientsApi
