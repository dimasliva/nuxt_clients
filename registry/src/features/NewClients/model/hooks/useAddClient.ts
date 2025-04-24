import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useAddClient = () => {
  const store = useClientModalStore();
  const queryClient = useQueryClient();
  const { getParamsAddClient } = storeToRefs(store);
  
  const { setClientChangedAt, setClientId } = store;

  const { mutate: addClient, isPending: isPendingAddClient } =
    useMutation({
      mutationKey: ["add client"],
      mutationFn: () => ClientService.addClient(getParamsAddClient.value),
      onSuccess: (response) => {
        setClientChangedAt(response.result.changedAt) 
        setClientId(response.result.id)
        queryClient.invalidateQueries({
          queryKey: ["get clients"],
        });
      },
      onError: (error: any) => {},
    });

  return {
    addClient,
    isPendingAddClient,
  };
};
