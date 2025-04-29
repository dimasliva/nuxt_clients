import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

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
        toast.success("Адрес клиента успешно изменён!");
      },
      onError: (error: any) => {
        toast.error("Ошибка при изменении адреса клиента!");
      },
    });

  return {
    updateSetClientAddresses,
    isPendingSetClientAddresses,
  };
};
