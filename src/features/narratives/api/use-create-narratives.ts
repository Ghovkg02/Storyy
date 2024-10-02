import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.narratives["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.narratives["$post"]>["json"];

export const useCreateNarratives = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.narratives.$post({ json });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["narratives"] });
    },
    onError: () => {
      // Handle error here if needed, or leave it out if no specific error handling is required
    }
  });

  return mutation;
};
