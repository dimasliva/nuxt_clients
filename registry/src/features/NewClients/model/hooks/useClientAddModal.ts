import type { IOpenUserId } from "../types/clients";
import { useGetClient } from "./useGetClient";
import { useGetClientRecords } from "./useGetClientRecords";

export const useClientAddModal = (openUserId: Ref<IOpenUserId>) => {
  const store = useClientModalStore();
  const { activeTab } = storeToRefs(store);

  const { data,  } = useGetClient(openUserId);
  const {} = useGetClientRecords(openUserId)

  return {
    activeTab,
  };
};
