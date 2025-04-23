import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useUpdateFileLInk } from "./useUpdateFileLInk";

export const useUpdateClientAvatar = () => {
  const store = useClientModalStore();
  const { openUserPhoto, updatedAvatar } = storeToRefs(store);

  const { setParamsUpdateFilelink } = store;

  const {updateClient} = useUpdateFileLInk()

  const { mutate: updateClientAvatar, isPending: isPendingUpdateClientAvatar } =
    useMutation({
      mutationKey: ["update client avatar", openUserPhoto.value.id],
      mutationFn: () => {
        if (!updatedAvatar.value) {
          return Promise.reject("No avatar to update");
        }
        return FilesService.updateFile(updatedAvatar.value);
      },
      onSuccess: (response) => {
        setParamsUpdateFilelink(response.result)
        updateClient()
      },
      onError: (error: any) => {},
    });

  return {
    updateClientAvatar,
    isPendingUpdateClientAvatar,
  };
};
