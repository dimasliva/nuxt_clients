import { useQuery } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export const useGetClient = () => {
  const store = useClientModalStore();
  const { openUserId } = storeToRefs(store);

  const { data, refetch, isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get client", openUserId.value],
    queryFn: async () => {
      try {
        return await ClientService.getClient(openUserId.value);
      } catch (err) {
        toast.error("Ошибка при получении данных клиента!");
      }
    },
    enabled: openUserId.value !== '-1',
    
    
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
