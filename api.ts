import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api`,
    prepareHeaders(headers) {
      if (headers.get('x-skip-auth')) {
        headers.delete('authorization');
        headers.delete('x-skip-auth');
        return headers;
      }
      const token = Cookies.get('sessionToken');
      if (token) {
        headers.set('authorization', `${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Doctors', 'Institutions', 'Patients', 'Study', 'GetStudy'],
  endpoints: () => ({}),
})