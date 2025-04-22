import { useQuery } from "@tanstack/vue-query";
import { ClientService } from "../service/ClientService";

export const useGetClient = () => {
  const store = useClientModalStore();
  const { openUserId } = storeToRefs(store);
  const { setFIOData } = store;

  const { data, refetch, isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get client ", openUserId.value],
    queryFn: () => ClientService.getClient(openUserId.value),
    select: (response) => {
      if (response) {
        setFIOData(response.result[0]);
      }
    },
    enabled: !!openUserId.value,
  });

  watch(openUserId, () => {
    if (openUserId.value !== '-1') {
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
