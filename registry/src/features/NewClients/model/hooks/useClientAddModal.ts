
import { useGetClient } from "./useGetClient";
import { useGetClientAvatar } from "./useGetClientAvatar";
import { useGetClientRecords } from "./useGetClientRecords";

export const useClientAddModal = () => {
  const store = useClientModalStore();
  const { activeTab, openUserId } = storeToRefs(store);

  const {} = useGetClientRecords()
  const {} = useGetClientAvatar();

  return {
    activeTab,
    openUserId
  };
};
