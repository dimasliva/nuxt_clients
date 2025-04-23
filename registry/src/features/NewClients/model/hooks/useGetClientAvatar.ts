import { useQuery } from "@tanstack/vue-query";
import { FilesService } from "~/src/features/Files/model/service/FilesService";

export const useGetClientAvatar = () => {
  
    const store = useClientModalStore();
    const { userInfo, openUserPhoto } = storeToRefs(store);
    const {setAvatar} = store

    const { data, isLoading, refetch, isError, error, isPending } = useQuery({
      queryKey: ["get client avatar ", openUserPhoto.value.id || ''],
      queryFn: () => FilesService.downloadFile(openUserPhoto.value.id || ''),
      select: async (response) => {
        if (response) {
          setAvatar(response)
        }
      },
      enabled: !!openUserPhoto.value.id,
    });

    watch(openUserPhoto.value, () => {
      if(openUserPhoto.value.id) {
        refetch()
      } else {
        setAvatar(null)
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
  