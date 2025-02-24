import { V1Api, Configuration } from "@/sdk";
import { bindClassMethods } from "@/sdk/utils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const configuration = new Configuration({
    basePath: BASE_URL,
});

const AlumniApi = new V1Api(configuration);

bindClassMethods(AlumniApi, V1Api)

export default AlumniApi;