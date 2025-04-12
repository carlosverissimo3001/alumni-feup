import NestApi from '@/api';
import { LinkedinAuthDto, VerifyEmailDto, VerifyEmailTokenDto } from '@/sdk/api';
import { useMutation } from '@tanstack/react-query';


// TODO: ADD ERROR HANDLING

type useAuthenticateWithLinkedinProps = {
  data: LinkedinAuthDto;
  onSuccess: () => void;
  onError: () => void;
};


export const useAuthenticateWithLinkedin = ({ data, onSuccess, onError }: useAuthenticateWithLinkedinProps) => {
  const mutation = useMutation({
    mutationFn: () => NestApi.userControllerLinkedinAuth(data),
    onSuccess,
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
