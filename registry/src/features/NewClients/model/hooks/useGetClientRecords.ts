import { useQuery } from "@tanstack/vue-query";

export const useGetClientRecords = () => {
  const store = useClientModalStore();
  const { openUserId } = storeToRefs(store);

  const { data, refetch, isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get client records ", openUserId.value],
    queryFn: () => RecordService.getClientRecords(openUserId.value),
    enabled: openUserId.value !== '-1'
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
