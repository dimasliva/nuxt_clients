
export const useClientAddModalAddressActual = () => {

  const store = useClientModalStore();
  const {
    actualAddress
  } = storeToRefs(store);

  return {
    actualAddress,
  };
};
