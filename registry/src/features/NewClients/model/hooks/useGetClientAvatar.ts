import { useQuery } from "@tanstack/vue-query";
import { FilesService } from "~/src/features/Files/model/service/FilesService";

export const useGetClientAvatar = () => {
  
    const store = useClientModalStore();
    const { openUserPhoto } = storeToRefs(store);
    const {setAvatar} = store

    const { data, isLoading, refetch, isError, error, isPending } = useQuery({
      queryKey: ["get client avatar ", openUserPhoto.value.id || ''],
      queryFn: () => FilesService.downloadFile(openUserPhoto.value.id || ''),
      enabled: !!openUserPhoto.value.id,
    });

    watch(openUserPhoto.value, async () => {
      if(openUserPhoto.value.id) {
        const response = await refetch()
        if(response.data) {
          setAvatar(response.data, true)
        }
      } else {
        setAvatar(null, true)
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
  