export const useClientAddModalTabContact = () => {
  const store = useClientModalStore();
  const { userInfo } = storeToRefs(store);

  return {
    userInfo
  };
};
