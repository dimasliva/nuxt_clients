
export const useClientAddModalAddressPermanent = () => {
  const store = useClientModalStore();
  const {
    permanentAddress,
    isActualAddress,
  } = storeToRefs(store);


  return {
    permanentAddress,
    isActualAddress,
  };
};
