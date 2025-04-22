import { useQuery } from "@tanstack/vue-query";
import { FilesService } from "~/src/features/Files/model/service/FilesService";

export const useGetClientAvatar = () => {
  
    const store = useClientModalStore();
    const { userInfo, openUserPhotoId } = storeToRefs(store);
    const {setAvatar} = store

    const { data, isLoading, refetch, isError, error, isPending } = useQuery({
      queryKey: ["get client avatar ", openUserPhotoId.value|| ''],
      queryFn: () => FilesService.downloadFile(openUserPhotoId.value || ''),
      select: async (response) => {
        if (response) {
          setAvatar(response)
        }
      },
      enabled: !!openUserPhotoId.value,
    });

    watch(openUserPhotoId, () => {
      userInfo.value.avatarPreview = ""
      if(openUserPhotoId.value) {
        refetch()
      }
    })

    return {
      data,
      isLoading,
      isError,
      error,
      isPending,
    };
  };
  