
export const useClientAddModalAddressPermanent = () => {
  const store = useClientModalStore();
  const {
    userInfo
  } = storeToRefs(store);


  return {
    userInfo,
  };
};
