import NestApi from "@/api";
import { useMutation } from "@tanstack/react-query";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import {
  UserControllerVerifyEmailRequest,
  UserControllerVerifyEmailTokenRequest,
  UserControllerLinkedinAuthRequest,
  UserAuthResponse,
  UserControllerLinkedinConfirmRequest,
} from "@/sdk";

// Define the response type from our backend

type UseAuthenticateWithLinkedinProps = {
  onSuccess: () => void;
  onError: () => void;
};

export const useAuthenticateWithLinkedin = ({
  onSuccess,
  onError,
}: UseAuthenticateWithLinkedinProps) => {
  const { login } = useAuthContext();

  return useMutation<
    UserAuthResponse,
    Error,
    UserControllerLinkedinAuthRequest
  >({
    mutationFn: (authData) => NestApi.userControllerLinkedinAuth(authData),
    onSuccess: (response) => {
      if (response?.accessToken && response.user) {
        login(response.accessToken, response.user);
      }
      onSuccess();
    },
    onError,
  });
};

type useVerifyEmailProps = {
  data: UserControllerVerifyEmailRequest;
  onSuccess: () => void;
  onError: () => void;
};

export const useVerifyEmail = ({
  data,
  onSuccess,
  onError,
}: useVerifyEmailProps) => {
  const mutation = useMutation({
    mutationFn: () => NestApi.userControllerVerifyEmail(data),
    onSuccess,
    onError,
  });

  return mutation;
};

type useVerifyEmailTokenProps = {
  data: UserControllerVerifyEmailTokenRequest;
  onSuccess: () => void;
  onError: () => void;
};

export const useVerifyEmailToken = ({
  data,
  onSuccess,
  onError,
}: useVerifyEmailTokenProps) => {
  const mutation = useMutation({
    mutationFn: () => NestApi.userControllerVerifyEmailToken(data),
    onSuccess,
    onError,
  });
  return mutation;
};

type useLinkedinConfirmProps = {
  data: UserControllerLinkedinConfirmRequest;
  onSuccess: () => void;
  onError: () => void;
};

export const useLinkedinConfirm = ({
  data,
  onSuccess,
  onError,
}: useLinkedinConfirmProps) => {
  const { login } = useAuthContext();
  const mutation = useMutation({
    mutationFn: () => NestApi.userControllerLinkedinConfirm(data),
    onSuccess: (response) => {
      if (response?.accessToken && response.user) {
        login(response.accessToken, response.user);
      }
      onSuccess();
    },
    onError,
  });
  return mutation;
};
