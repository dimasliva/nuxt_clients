import { useMutation } from "@tanstack/vue-query";
import { useUpdateFileLInk } from "./useUpdateFileLInk";

export const useUploadFile = () => {
  const store = useClientModalStore();
  const { openUserPhoto, updatedAvatar } = storeToRefs(store);

  const { setParamsUpdateFilelink } = store;

  const {updateClient} = useUpdateFileLInk()

  const { mutate: uploadFile, isPending: isPendingUploadFile } =
    useMutation({
      mutationKey: ["update client avatar", openUserPhoto.value.id],
      mutationFn: () => {
        if (!updatedAvatar.value) {
          return Promise.reject("No avatar to update");
        }
        return FilesService.uploadFile(updatedAvatar.value);
      },
      onSuccess: (response) => {
        setParamsUpdateFilelink(response.result)
        updateClient()
      },
      onError: (error: any) => {},
    });

  return {
    uploadFile,
    isPendingUploadFile,
  };
};
