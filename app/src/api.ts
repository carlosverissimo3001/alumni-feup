import { V1Api, Configuration } from "@/sdk";
import { bindClassMethods } from "@/sdk/utils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to safely access localStorage (only in browser)
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

// Custom middleware configuration for authentication
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
