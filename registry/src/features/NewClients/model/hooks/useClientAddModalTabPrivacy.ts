import { useQuery } from "@tanstack/vue-query";
import { DictionaryService } from "../../../Dictionary/model/service/DictionaryService";

export const useClientAddModalTabPrivacy = () => {
  const documents = reactive<string[]>([]);
  const selectedDocument = ref<string>("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["get all dictionary documents"],
    queryFn: () => DictionaryService.getDocuments(),
  });

  watch(data, () => {
    if (data.value) {
      documents.length = 0;
      const result = data.value.result;
      if (result) {
        selectedDocument.value = result[Object.keys(result)[0]].value;
        console.log("Object.keys(result)", Object.keys(result));
        Object.keys(result).forEach((key) => {
          documents.push(result[key].value);
        });
      }
    }
  });

  return {
    documents,
    selectedDocument,
    data,
    error,
    isLoading,
    isError,
  };
};
