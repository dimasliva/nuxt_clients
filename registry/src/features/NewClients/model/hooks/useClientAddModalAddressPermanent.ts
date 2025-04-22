
export const useClientAddModalAddressPermanent = () => {
  const store = useClientModalStore();
  const {
    isActualAddress,
    userInfo
  } = storeToRefs(store);


  return {
    userInfo,
    isActualAddress,
  };
};
