import { useMutation } from "@tanstack/vue-query";

export const useAddClient = () => {
  const store = useClientModalStore();
  const { getParamsAddClient } = storeToRefs(store);
  
  const { onClientChangedAt, onClientId } = store;

  const { mutate: addClient, isPending: isPendingAddClient } =
    useMutation({
      mutationKey: ["add client"],
      mutationFn: () => ClientService.addClient(getParamsAddClient.value),
      onSuccess: (response) => {
        onClientChangedAt(response.result.changedAt) 
        onClientId(response.result.id)
      },
      onError: (error: any) => {},
    });

  return {
    addClient,
    isPendingAddClient,
  };
};
