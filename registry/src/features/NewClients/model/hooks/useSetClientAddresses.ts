import { useMutation } from "@tanstack/vue-query";

export const useSetClientAddresses = () => {
  const store = useClientModalStore();
  const { openUserId, getParamsSetClientAddresses } = storeToRefs(store);
  
  
  const { setAddressesChangedAt } = store;

  const { mutate: updateSetClientAddresses, isPending: isPendingSetClientAddresses } =
    useMutation({
      mutationKey: ["set client addresses ", openUserId.value],
      mutationFn: () => ClientService.setClientAddresses(getParamsSetClientAddresses.value),
      onSuccess: (response) => {
        setAddressesChangedAt(response.result.changedAt)
        console.log("dwdw33dwd3")
      },
      onError: (error: any) => {},
    });

  return {
    updateSetClientAddresses,
    isPendingSetClientAddresses,
  };
};
