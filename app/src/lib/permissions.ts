import NestAPI from "@/api";
import { UserControllerCheckPermissionRequest } from "@/sdk";

export async function checkPermission(
  params: UserControllerCheckPermissionRequest
): Promise<boolean> {
  const result = await NestAPI.userControllerCheckPermission(params);
  return Boolean(result);
}
