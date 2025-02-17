import { S3Params } from '@/schemas/s3';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const s3Api = createApi({
  reducerPath: 's3Api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
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
  endpoints: (builder) => ({
    uploadFileToS3: builder.mutation<string, { file: File, client_id: string }>({
      async queryFn({ file, client_id }, _queryApi, _extraOptions, fetchWithBQ) {
        const s3ParamsResult = await fetchWithBQ({
          url: '/client_studies/upload_link',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id,
            file_name: file.name,
          }),
        });

        if (s3ParamsResult.error) {
          return { error: s3ParamsResult.error as any };
        }

        const s3Params = s3ParamsResult.data as S3Params;

        const formData = new FormData();
        Object.entries(s3Params).forEach(([key, value]) => {
          if (key !== 'url') {
            formData.append(key, value);
          }
        });
        formData.append('file', file);

        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const uploadResult = await fetchWithBQ({
          url: `${origin}/s3-upload`,
          method: 'POST',
          body: formData,
          headers: {
            'x-skip-auth': 'true',
          }
        });

        if (uploadResult.error) {
          return { error: uploadResult.error as any };
        }

        return { data: s3Params.key };
      },
    }),
  }),
})

export const {
  useUploadFileToS3Mutation,
} = s3Api
