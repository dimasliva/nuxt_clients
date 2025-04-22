
export const useClientAddModalAddressActual = () => {

  const store = useClientModalStore();
  const {
    actualAddress,
    userInfo,
  } = storeToRefs(store);

  return {
    userInfo,
    actualAddress,
  };
};
