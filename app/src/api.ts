import { V1Api } from "@/sdk/apis";
import { bindClassMethods } from "@/sdk/utils";
import { Configuration } from "@/sdk/runtime";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const configuration = new Configuration({
    basePath: BASE_URL,
    credentials: 'include',
});

const NestAPI = new V1Api(configuration);

bindClassMethods(NestAPI, V1Api)

export default NestAPI;
