import { api } from '@/api';
import { ListDoctor, ListDoctorsResponse, NewDoctor } from '@/schemas/doctors';

export const doctorsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createDoctor: builder.mutation<ListDoctor, Partial<Omit<NewDoctor, 'birth_date' | 'medical_institutions'> & { birth_date: string, medical_institution_ids: string[] }>>({
      query: (data) => ({
        url: '/doctors',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Doctors'],
    }),
    listDoctors: builder.query<ListDoctorsResponse, { page?: number, medical_institution_id?: string, query?: string, state?: string }>({
      query: ({ page = 1, medical_institution_id, query = "", state = "" }) => `/doctors?page=${page}&medical_institution_id=${medical_institution_id}&query=${query}&state=${state}`,
      providesTags: ['Doctors'],
    }),
    getDoctor: builder.query<ListDoctor, string>({
      query: (id) => `/doctors/${id}`,
      providesTags: ['Doctors'],
    }),
    getAllDoctors: builder.query<{ id: string, name: string }[], void>({
      query: () => '/doctors/find_all',
      providesTags: ['Doctors'],
    }),
    updateDoctor: builder.mutation<ListDoctor, Partial<Omit<NewDoctor, 'medical_institutions' | 'birth_date'> & { medical_institution_ids: string[], id: string, birth_date: string }>>({
      query: ({ id, ...data }) => ({
        url: `/doctors/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Doctors'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListDoctorsQuery,
  useGetDoctorQuery,
  useUpdateDoctorMutation,
  useCreateDoctorMutation,
  useGetAllDoctorsQuery,
  useLazyGetDoctorQuery
} = doctorsApi
