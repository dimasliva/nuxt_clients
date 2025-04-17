export const useClientAddModalTabs = () => {
  const store = useClientModalStore();
  const { activeTab } = storeToRefs(store);
  return {
    activeTab
  };
};
