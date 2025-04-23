import { useMutation } from "@tanstack/vue-query";

export const useSetClientDocuments = () => {
  const store = useClientModalStore();
  const { openUserPhoto, getParamsSetClientDocuments } = storeToRefs(store);
  
  const { setDocumentsChangedAt } = store;

  const { mutate: updateSetClientDocuments, isPending: isPendingSetClientDocuments } =
    useMutation({
      mutationKey: ["set client documents ", openUserPhoto.value.id],
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
