import AlumniApi from '@/api';
import { LinkedinAuthDto } from '@/sdk/api';

export const authenticateWithLinkedin = async (data: LinkedinAuthDto) => {
  return await AlumniApi.userControllerLinkedinAuth(data)
};
