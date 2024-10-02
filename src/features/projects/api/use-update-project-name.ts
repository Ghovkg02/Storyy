import { client } from "@/lib/hono";
import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Assuming RequestType has a field for the new project name
type ResponseType = InferResponseType<typeof client.api.projects[":id"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.projects[":id"]["$patch"]>["json"];

export const useUpdateProjectName = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    { name: string } // Updated RequestType to specifically handle renaming
  >({
    mutationKey: ["project", { id }],
    mutationFn: async ({ name }) => {
      const response = await client.api.projects[":id"].$patch({ 
        json: { name }, // Send only the new name
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to update project name");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", { id }] });
      toast.success("Project name updated successfully");
    },
    onError: () => {
      toast.error("Failed to update project name");
    }
  });

  return mutation;
};
