import { useMutation } from "@tanstack/vue-query";

export const useSetClientDocuments = () => {
  const store = useClientModalStore();
  const { openUserId, getParamsSetClientDocuments } = storeToRefs(store);
  
  const { setDocumentsChangedAt } = store;

  const { mutate: updateSetClientDocuments, isPending: isPendingSetClientDocuments } =
    useMutation({
      mutationKey: ["set client documents ", openUserId.value],
      mutationFn: () => ClientService.setClientDocuments(getParamsSetClientDocuments.value),
      onSuccess: (response) => {
        setDocumentsChangedAt(response.result.changedAt)
      },
      onError: (error: any) => {},
    });

  return {
    updateSetClientDocuments,
    isPendingSetClientDocuments,
  };
};
