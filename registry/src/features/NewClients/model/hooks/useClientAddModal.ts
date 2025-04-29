import { useGetClientAvatar } from "./useGetClientAvatar";

export const useClientAddModal = () => {
  const store = useClientModalStore();
  const {
    toastErrorText,
    openUserId,
    userInfo,
    notChangedUserInfo,
    getIsUserInfoValidated,
  } = storeToRefs(store);
  const activeTab = ref(EClientTabs.profile)


  const {} = useGetClientAvatar();

  // watch(userInfo, () => {
  //   console.log(" ");
  //   console.log("userInfo", userInfo.value.documents);
  //   console.log("notChangedUserInfo.value", notChangedUserInfo.value.documents);
  // }, {deep: true});

  return {
    toastErrorText,
    activeTab,
    openUserId,
    getIsUserInfoValidated,
  };
};
