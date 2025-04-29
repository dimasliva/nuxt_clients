import { useMutation,  } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export const useUpdateClient = () => {
  const store = useClientModalStore();
  const { openUserId, getUser } = storeToRefs(store);

  const { setChangedAt } = store;

  const { mutate: updateClient, isPending: isPendingUpdateClient } =
    useMutation({
      mutationKey: ["update client ", openUserId.value],
      mutationFn: () => ClientService.updateClient(getUser.value),
      onSuccess: (response) => {
        toast.success("Клиент успешно изменён!");
        setChangedAt(response.result.changedAt);
      },
      onError: (error: any) => {
        toast.error("Ошибка при изменении клиента!");
      },
    });

  return {
    updateClient,
    isPendingUpdateClient,
  };
};
