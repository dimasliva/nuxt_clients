import { useQuery } from "@tanstack/vue-query";
import { DictionaryService } from "../../../Dictionary/model/service/DictionaryService";

export const useGetClientDocuments = () => {
  const documents = reactive<string[]>([]);
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["get all dictionary documents"],
    queryFn: () => DictionaryService.getDocuments(),
    select: (response) => {
      documents.length = 0;
      let result = response.result;
      if (result) {
        Object.keys(result).forEach((key) => {
          documents.push(result[key].value);
        });
      }
    },
    staleTime: Infinity, 
    queryKeyHashFn: () => "get all dictionary documents",
  });

  return {
    documents,
    data,
    error,
    isLoading,
    isError,
  };
};
