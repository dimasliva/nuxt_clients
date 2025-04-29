export const useClientAddModalTabContact = () => {
  const store = useClientModalStore();
  const { userInfo } = storeToRefs(store);
  const {textRules} = useRules()

  return {
    userInfo,
    textRules
  };
};
