import { V1Api } from "@/sdk/apis";
import { bindClassMethods } from "@/sdk/utils";
import { Configuration } from "@/sdk/runtime";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const configuration = new Configuration({
    basePath: BASE_URL,
    middleware: [
        {
            pre: async ({ url, init }) => {
                const userId = getLocalStorageItem('userId');
                if (userId) {
                    init.headers = {
                        ...(init.headers as Record<string, string> || {}),
                        'X-User-ID': userId,
                    };
                }
                
                return { url, init };
            },
        },
    ],
});

const NestAPI = new V1Api(configuration);

bindClassMethods(NestAPI, V1Api)

export default NestAPI;
