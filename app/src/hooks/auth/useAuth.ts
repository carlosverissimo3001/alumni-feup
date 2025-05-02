import NestApi from "@/api";
import { useMutation } from "@tanstack/react-query";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import {
  AlumniControllerVerifyEmailRequest,
  AlumniControllerVerifyEmailTokenRequest,
  UserControllerLinkedinAuthRequest,
} from "@/sdk";

// Define the response type from our backend

// TODO: ADD ERROR HANDLING

type useAuthenticateWithLinkedinProps = {
  data: UserControllerLinkedinAuthRequest;
  onSuccess: () => void;
  onError: () => void;
};

export const useAuthenticateWithLinkedin = ({
  data,
  onSuccess,
  onError,
}: useAuthenticateWithLinkedinProps) => {
  const { login } = useAuthContext();

  const mutation = useMutation({
    mutationFn: () => NestApi.userControllerLinkedinAuth(data),
    onSuccess: (response) => {
      // Store the token in localStorage and update the auth context
      if (response && response.accessToken) {
        login(response.accessToken, response.user);
      }
      onSuccess();
    },
    onError,
  });
  return mutation;
};

type useVerifyEmailProps = {
  data: AlumniControllerVerifyEmailRequest;
  onSuccess: () => void;
  onError: () => void;
};

export const useVerifyEmail = ({
  data,
  onSuccess,
  onError,
}: useVerifyEmailProps) => {
  const mutation = useMutation({
    mutationFn: () => NestApi.alumniControllerVerifyEmail(data),
    onSuccess,
    onError,
  });

  return mutation;
};

type useVerifyEmailTokenProps = {
  data: AlumniControllerVerifyEmailTokenRequest;
  onSuccess: () => void;
  onError: () => void;
};

export const useVerifyEmailToken = ({
  data,
  onSuccess,
  onError,
}: useVerifyEmailTokenProps) => {
  const mutation = useMutation({
    mutationFn: () => NestApi.alumniControllerVerifyEmailToken(data),
    onSuccess,
    onError,
  });
  return mutation;
};
