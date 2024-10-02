import { InferResponseType } from "hono";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<typeof client.api.image[":id"]["$get"], 200>;

export const useGetImage = (id: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["image", { id }],
    queryFn: async () => {
      const response = await client.api.image[":id"].$get({
        param: {
          id,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }
      const { data } = await response.json();
      
      return Array.isArray(data) ? data : [data];
    },
  });
  return query;
};