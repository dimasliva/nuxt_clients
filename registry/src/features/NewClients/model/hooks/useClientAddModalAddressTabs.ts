export const useClientAddModalAddressTabs = () => {
  const store = useClientModalStore();
  const { userInfo } = storeToRefs(store);
  
  return {
    userInfo,
  };
};
