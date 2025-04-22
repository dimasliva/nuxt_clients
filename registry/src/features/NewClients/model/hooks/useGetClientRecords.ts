import { useQuery } from "@tanstack/vue-query";
import { RecordService } from "~/src/features/Records/model/service/RecordService";

export const useGetClientRecords = () => {
  const store = useClientModalStore();
  const {setUserInfo} = store
  const {openUserId} = storeToRefs(store)

  const { data, refetch, isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get client records ", openUserId.value],
    queryFn: () => RecordService.getClientRecords(openUserId.value),
    select: (response) => {
      if (response.result.length) {
        setUserInfo(response.result)
      }
    },
    enabled: !!openUserId.value
  });

  watch(openUserId, () => {
    if(openUserId.value !== '-1') {
      refetch();
    }
  });

  return {
    data,
    isLoading,
    isError,
    error,
    isPending,
    refetch,
  };
};
