import { useQuery } from "@tanstack/vue-query";

export const useGetAllRegions = () => {
  const regions = reactive<string[]>([]);
  const store = useClientModalStore();
  const { setAddressRegion } = store;

  const { data, isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get all dictionary regions"],
    queryFn: () => DictionaryService.getRegions(),
    select: (response) => {
      if (response) {
        let result = response.result;
        Object.keys(result).forEach((key) => {
          regions.push(result[key].value);
        });
        setAddressRegion(regions[0]);
      }
    },
  });

  return {
    regions,
    data,
    isLoading,
    isError,
    error,
    isPending,
  };
};
