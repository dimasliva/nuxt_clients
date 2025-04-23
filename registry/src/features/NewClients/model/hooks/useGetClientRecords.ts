import { useQuery } from "@tanstack/vue-query";

export const useGetClientRecords = () => {
  const store = useClientModalStore();
  const {setUserInfo} = store
  const {openUserId} = storeToRefs(store)

  const { data, refetch, isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get client records ", openUserId.value],
    queryFn: () => RecordService.getClientRecords(openUserId.value),
  });

  watch(openUserId, async (newValue) => {
    if (newValue !== '-1') {
      const res = await refetch();
      if(res.data) {
        setUserInfo(res.data.result)
      }
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
