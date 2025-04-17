
export const usePageBtns = () => {
  const store = usePageStore();
  const {currPage} = storeToRefs(store);
  

  return {
    currPage
  };
};
