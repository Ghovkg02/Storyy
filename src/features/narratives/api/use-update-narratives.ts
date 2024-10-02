import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.narratives[":id"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.narratives[":id"]["$patch"]>["json"];

export const useUpdateNarratives = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationKey: ["narrative", { id }],
    mutationFn: async (json) => {
      const response = await client.api.narratives[":id"].$patch({ 
        json,
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to update narrative");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["narratives"] });
      queryClient.invalidateQueries({ queryKey: ["narrative", { id }] });
    },
    onError: () => {
      // Handle error here if needed, or leave it out if no specific error handling is required
    }
  });

  return mutation;
};
