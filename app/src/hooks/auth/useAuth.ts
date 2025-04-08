import NestApi from '@/api';
import { LinkedinAuthDto } from '@/sdk/api';

export const authenticateWithLinkedin = async (data: LinkedinAuthDto) => {
  return await NestApi.userControllerLinkedinAuth(data)
};
