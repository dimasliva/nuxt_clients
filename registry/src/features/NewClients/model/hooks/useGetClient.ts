import { useQuery } from "@tanstack/vue-query";

export const useGetClient = () => {
  const store = useClientModalStore();
  const { openUserId } = storeToRefs(store);
  const { setFIOData } = store;

  const { data, refetch, isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get client", openUserId.value],
    queryFn: () => ClientService.getClient(openUserId.value),
  });

  watch(openUserId, async (newValue) => {
    if (newValue !== '-1') {
      const res = await refetch();
      if(res.data) {
        if(res.data.result[0]) {
          setFIOData(res.data.result[0]);
        }
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
