import { Configuration, V1Api } from './index';

const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010',
  credentials: 'include',
});

export const api = new V1Api(config);
