import { useMutation } from "@tanstack/vue-query";
import { useSetClientSd } from "./useSetClientSd";

export const useUpdateFileLInk = () => {
  const store = useClientModalStore();
  const { openUserPhoto, paramsUpdateFilelink } = storeToRefs(store);

  const {  } = store;
  const {updateSetClientSd} = useSetClientSd()

  const { mutate: updateClient, isPending: isPendingUpdateClient } =
    useMutation({
      mutationKey: ["update file link ", openUserPhoto.value.id],
      mutationFn: () => FilesService.updateFileLink(paramsUpdateFilelink.value),
      onSuccess: (response) => {
        updateSetClientSd()
      },
      onError: (error: any) => {},
    });

  return {
    updateClient,
    isPendingUpdateClient,
  };
};
