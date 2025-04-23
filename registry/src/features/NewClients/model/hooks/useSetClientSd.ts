import { useMutation } from "@tanstack/vue-query";

export const useSetClientSd = () => {
  const store = useClientModalStore();
  const { openUserPhoto, getParamsSetClientSd } = storeToRefs(store);
  
  const {  } = store;

  const { mutate: updateSetClientSd, isPending: isPendingUpdateClient } =
    useMutation({
      mutationKey: ["set clientsd ", openUserPhoto.value.id],
      mutationFn: () => ClientService.SetClientSd(getParamsSetClientSd.value),
      onSuccess: (response) => {
      },
      onError: (error: any) => {},
    });

  return {
    updateSetClientSd,
    isPendingUpdateClient,
  };
};
