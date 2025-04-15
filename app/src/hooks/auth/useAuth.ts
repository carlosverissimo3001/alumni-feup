import NestApi from '@/api';
import { LinkedinAuthDto, VerifyEmailDto, VerifyEmailTokenDto, UserAuthResponse } from '@/sdk/api';
import { useMutation } from '@tanstack/react-query';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { AxiosResponse } from 'axios';
// Define the response type from our backend

// TODO: ADD ERROR HANDLING

type useAuthenticateWithLinkedinProps = {
  data: LinkedinAuthDto;
  onSuccess: () => void;
  onError: () => void;
};

export const useAuthenticateWithLinkedin = ({ data, onSuccess, onError }: useAuthenticateWithLinkedinProps) => {
  const { login } = useAuthContext();
  
  const mutation = useMutation<AxiosResponse<UserAuthResponse>, Error, void>({
    mutationFn: () => NestApi.userControllerLinkedinAuth(data),
    onSuccess: (response) => {
      // Store the token in localStorage and update the auth context
      if (response && response.data && response.data.access_token) {
        login(response.data.access_token, response.data.user);
      }
      onSuccess();
    },
    onError,
  });
  return mutation;
};

type useVerifyEmailProps = {
  data: VerifyEmailDto;
  onSuccess: () => void;
  onError: () => void;
};

export const useVerifyEmail = ({ data, onSuccess, onError }: useVerifyEmailProps) => {
  const mutation = useMutation({
    mutationFn: () => NestApi.alumniControllerVerifyEmail(data),
    onSuccess,
    onError,
  });

  return mutation;
};

type useVerifyEmailTokenProps = {
  data: VerifyEmailTokenDto;
  onSuccess: () => void;
  onError: () => void;
};

export const useVerifyEmailToken = ({ data, onSuccess, onError }: useVerifyEmailTokenProps) => {
  const mutation = useMutation({
    mutationFn: () => NestApi.alumniControllerVerifyEmailToken(data),
    onSuccess,
    onError,
  });
  return mutation;
};
