import { api } from '@/api';
import { SignInRequest, SignInResponse, SignUpRequest, User } from '@/schemas/auth';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<SignInResponse, SignInRequest>({
      query: (body) => ({
        url: '/users/login',
        method: 'POST',
        body,
      }),
    }),
    user: builder.query<User, void>({
      query: () => '/users/me',
    }),
    signUp: builder.mutation<SignInResponse, SignUpRequest>({
      query: (body) => ({
        url: '/users/register',
        method: 'POST',
        body,
      }),
    }),
    verifyToken: builder.mutation<void, { token: string }>({
      query: ({ token }) => ({
        url: '/users/validate_token',
        method: 'POST',
        body: { token },
      }),
    }),
    sendRecoveryEmail: builder.mutation<void, { email: string }>({
      query: ({ email }) => ({
        url: '/users/init_reset',
        method: 'POST',
        body: { email },
      }),
    }),
    updatePassword: builder.mutation<void, { email: string; new_password: string; code: string }>({
      query: ({ email, new_password, code }) => ({
        url: '/users/reset_password',
        method: 'POST',
        body: { email, new_password, code },
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useSignInMutation,
  useUserQuery,
  useSignUpMutation,
  useVerifyTokenMutation,
  useSendRecoveryEmailMutation,
  useUpdatePasswordMutation,
} = authApi
