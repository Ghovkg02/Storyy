import { InferResponseType } from "hono";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.narratives)[":id"]["$get"],
  200
>;

export const useGetNarratives = (id: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["narratives", { id }],
    queryFn: async () => {
      const response = await client.api.narratives[":id"].$get({
        param: {
          id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
