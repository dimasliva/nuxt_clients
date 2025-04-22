
import { useGetClient } from "./useGetClient";
import { useGetClientAvatar } from "./useGetClientAvatar";
import { useGetClientRecords } from "./useGetClientRecords";

export const useClientAddModal = () => {
  const store = useClientModalStore();
  const { activeTab, userInfo } = storeToRefs(store);

  const { data } = useGetClient();
  const {} = useGetClientRecords()
  const {} = useGetClientAvatar();

  watch(data, () => {
    console.log("data", data)
  })

  return {
    activeTab,
    userInfo,
  };
};
