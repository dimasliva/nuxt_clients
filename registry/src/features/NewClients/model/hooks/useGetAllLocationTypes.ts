import { useQuery } from "@tanstack/vue-query";

export const useGetAllLocationTypes = () => {
  const locationTypes = reactive<string[]>([]);
  const store = useClientModalStore();
  const { setAddressLocationType } = store;

  const { data, isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get all dictionary location types"],
    queryFn: () => DictionaryService.getAllLocationTypes(),
    select: (response) => {
      if (response) {
        let result = response.result;
        Object.keys(result).forEach((key) => {
          locationTypes.push(result[key].value2);
        });
        setAddressLocationType(locationTypes[0]);
      }
    },
  });

  return {
    locationTypes,
    data,
    isLoading,
    isError,
    error,
    isPending,
  };
};
