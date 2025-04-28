import { useMutation,  } from "@tanstack/vue-query";

export const useUpdateClient = () => {
  const store = useClientModalStore();
  const { openUserId, getUser } = storeToRefs(store);

  const { setChangedAt } = store;

  const { mutate: updateClient, isPending: isPendingUpdateClient } =
    useMutation({
      mutationKey: ["update client ", openUserId.value],
      mutationFn: () => ClientService.updateClient(getUser.value),
      onSuccess: (response) => {
        setChangedAt(response.result.changedAt);
      },
      onError: (error: any) => {},
    });

  return {
    updateClient,
    isPendingUpdateClient,
  };
};
