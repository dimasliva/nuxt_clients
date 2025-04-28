import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  const { mutate: deleteClient, isPending: isPendingDeleteClient } =
    useMutation({
      mutationKey: ["delete client"],
      mutationFn: (id: string) => ClientService.deleteClient(id),
      onSuccess: (response) => {
        queryClient.invalidateQueries({
          queryKey: ["get clients"],
        });
      },
      onError: (error: any) => {},
    });

  return {
    deleteClient,
    isPendingDeleteClient,
  };
};
