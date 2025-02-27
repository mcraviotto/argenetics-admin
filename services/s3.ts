import { api } from '@/api';
import { S3Params } from '@/schemas/s3';

export const s3Api = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadFileToS3: builder.mutation<string, { file: File, patient_id: string }>({
      async queryFn({ file, patient_id }, _queryApi, _extraOptions, fetchWithBQ) {
        const s3ParamsResult = await fetchWithBQ({
          url: '/studies/upload_link',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id,
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
  overrideExisting: false,
})

export const {
  useUploadFileToS3Mutation,
} = s3Api
