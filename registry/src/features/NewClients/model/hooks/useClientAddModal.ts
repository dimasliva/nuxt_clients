
import { useGetClient } from "./useGetClient";
import { useGetClientAvatar } from "./useGetClientAvatar";
import { useGetClientRecords } from "./useGetClientRecords";

export const useClientAddModal = () => {
  const store = useClientModalStore();
  const { activeTab, userInfo } = storeToRefs(store);

  const { } = useGetClient();
  const {} = useGetClientRecords()
  const {} = useGetClientAvatar();

  return {
    activeTab,
    userInfo,
  };
};
