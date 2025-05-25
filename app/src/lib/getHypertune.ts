import "server-only";
import { VercelEdgeConfigInitDataProvider } from "hypertune";
import { createClient } from "@vercel/edge-config";
import { unstable_noStore as noStore } from "next/cache";
import { createSource } from "@/generated/hypertune";

const hypertuneSource = createSource({
  token: process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN!,
  initDataProvider:
    process.env.EXPERIMENTATION_CONFIG &&
    process.env.EXPERIMENTATION_CONFIG_ITEM_KEY
      ? new VercelEdgeConfigInitDataProvider({
          edgeConfigClient: createClient(
            process.env.EXPERIMENTATION_CONFIG,
          ),
          itemKey: process.env.EXPERIMENTATION_CONFIG_ITEM_KEY,
        })
      : undefined,
});

export default async function getHypertune() {
  noStore();
  await hypertuneSource.initIfNeeded();

  return hypertuneSource.root({
    args: {
      context: {
        // Not used for now
        // environment: process.env.NODE_ENV,
        // user: { id: "1", name: "Test", email: "test@example.com" },
      },
    },
  });
}
