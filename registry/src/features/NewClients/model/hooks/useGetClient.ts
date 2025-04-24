import { useQuery } from "@tanstack/vue-query";

export const useGetClient = () => {
  const store = useClientModalStore();
  const { openUserId } = storeToRefs(store);

  const { data, refetch, isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get client", openUserId.value],
    queryFn: () => ClientService.getClient(openUserId.value),
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
