import { useGetClientAvatar } from "./useGetClientAvatar";

export const useClientAddModal = () => {
  const store = useClientModalStore();
  const {
    activeTab,
    openUserId,
    userInfo,
    notChangedUserInfo,
    getIsUserInfoValidated: getIsUserInfoChanged,
  } = storeToRefs(store);

  const {} = useGetClientAvatar();

  watch(userInfo, () => {
    console.log(" ");
    console.log("userInfo", userInfo.value.contacts);
    console.log("notChangedUserInfo.value", notChangedUserInfo.value.contacts);
  }, {deep: true});

  return {
    activeTab,
    openUserId,
    getIsUserInfoChanged,
  };
};
