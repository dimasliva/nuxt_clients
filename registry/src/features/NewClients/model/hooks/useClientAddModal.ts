import { useGetClientAvatar } from "./useGetClientAvatar";

export const useClientAddModal = () => {
  const store = useClientModalStore();
  const {
    
    openUserId,
    userInfo,
    notChangedUserInfo,
    getIsUserInfoValidated: getIsUserInfoChanged,
  } = storeToRefs(store);
  const activeTab = ref(EClientTabs.profile)


  const {} = useGetClientAvatar();

  // watch(userInfo, () => {
  //   console.log(" ");
  //   console.log("userInfo", userInfo.value.documents);
  //   console.log("notChangedUserInfo.value", notChangedUserInfo.value.documents);
  // }, {deep: true});

  return {
    activeTab,
    openUserId,
    getIsUserInfoChanged,
  };
};
