import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export const useSetClientDocuments = () => {
  const store = useClientModalStore();
  const { openUserId, getParamsSetClientDocuments } = storeToRefs(store);

  const { setDocumentsChangedAt } = store;

  const {
    mutate: updateSetClientDocuments,
    isPending: isPendingSetClientDocuments,
  } = useMutation({
    mutationKey: ["set client documents ", openUserId.value],
    mutationFn: () =>
      ClientService.setClientDocuments(getParamsSetClientDocuments.value),
    onSuccess: (response) => {
      setDocumentsChangedAt(response.result.changedAt);
      toast.success("Документ клиента успешно изменён!");
    },
    onError: (error: any) => {
      toast.error("Ошибка при изменении документа клиента!");
    },
  });

  return {
    updateSetClientDocuments,
    isPendingSetClientDocuments,
  };
};
