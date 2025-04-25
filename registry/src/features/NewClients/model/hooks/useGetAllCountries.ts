import { useQuery } from "@tanstack/vue-query";

export const useGetAllCountries = () => {
  const countries = reactive<string[]>([]);
  const store = useClientModalStore();
  const { setAddressCountry } = store;

  const { data, isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get all dictionary countries"],
    queryFn: () => DictionaryService.getCountries(),
    select: (response) => {
      if (response) {
        let result = response.result;
        if (result) {
          Object.keys(result).forEach((key) => {
            countries.push(result[key].value);
          });
          setAddressCountry(countries[0]);
        }
      }
    },
  });

  return {
    countries,
    data,
    isLoading,
    isError,
    error,
    isPending,
  };
};
