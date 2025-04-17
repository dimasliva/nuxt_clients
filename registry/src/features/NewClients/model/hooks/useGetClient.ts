import { useQuery } from "@tanstack/vue-query";
import { ClientService } from "../service/ClientService";
import type { IOpenUserId } from "../types/clients";

export const useGetClient = (id: Ref<IOpenUserId>) => {
  const store = useClientModalStore();
  const { userInfo } = storeToRefs(store);
  const { t } = useI18n();

  const { data, refetch, isLoading, isError, error, isPending } = useQuery({
    queryKey: ["get client ", id.value],
    queryFn: () => ClientService.getClient(id.value),
    select: (response) => {
      if (response) {
        let selectedGender = t("male");
        let gender = response.result[0].gender;
        switch (gender) {
          case EGenders.m:
            selectedGender = t("male");
            break;
          case EGenders.f:
            selectedGender = t("female");
            break;
          default:
            break;
        }
        userInfo.value = {
          ...response.result[0],
          selectedGender: selectedGender,
          mainDocumentNumber: '',
          mainDocumentSeries: '',
          mainDocumentWhen: '',
          mainDocumentWho: '',
          mainDocumentWhoCode: '',
          otherDocuments: [],
        };
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
