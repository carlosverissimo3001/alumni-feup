import { useMutation } from '@tanstack/react-query';
import NestAPI from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { AlumniControllerMarkAsMainRoleRequest } from '@/sdk';

type Input = {
  onSuccess?: () => void | Promise<void>;
};

export const useSetMainRole = ({ onSuccess }: Input) => {
  const queryClient = useQueryClient();

  const { mutate: setMainRole, isPending } = useMutation({
    mutationFn: (dto: AlumniControllerMarkAsMainRoleRequest) => {
      return NestAPI.alumniControllerMarkAsMainRole({
        id: dto.id,
      });
    },
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: ['profile', role.alumniId] });
      onSuccess?.();
    },
  });

  return { setMainRole, isPending };
};
