import { useQuery } from "@tanstack/vue-query";
import { RecordService } from "~/src/features/Records/model/service/RecordService";
import type { IClientOtherDocuments, IOpenUserId } from "../types/clients";

export const useGetClientRecords = (id: Ref<IOpenUserId>) => {
  const store = useClientModalStore();
  const { userInfo } = storeToRefs(store);

  console.log("id", id.value)
  console.log("id !== null", id !== null)
  const { data, refetch, isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get client records ", id.value],
    queryFn: () => RecordService.getClientRecords(id),
    select: (response) => {
      if (response) {
        let otherDocuments: IClientOtherDocuments[] = []
        userInfo.value.mainDocumentNumber = response.result[1].mainDocumentNumber || ''
        userInfo.value.mainDocumentSeries = response.result[1].mainDocumentSeries || ''
        userInfo.value.mainDocumentWhen = response.result[1].mainDocumentWhen || ''
        userInfo.value.mainDocumentWho = response.result[1].mainDocumentWho || ''
        userInfo.value.mainDocumentWhoCode = response.result[1].mainDocumentWhoCode || ''
        userInfo.value.otherDocuments = otherDocuments

        response.result[1]

        console.log(response)
        // userInfo.value
      }
    },
    enabled: !!id.value
  });

  watch(id, () => {
    refetch();
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
