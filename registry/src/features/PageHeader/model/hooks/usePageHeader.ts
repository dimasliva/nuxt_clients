
export const usePageHeader = () => {
  const store = usePageStore();
  const { unpinPageByIndex, getPinnedPageIndex, addPinPage } = usePageStore();
  const { getPinnedPages, currPin, currPage } = storeToRefs(store);

  const unpinPage = () => {
    unpinPageByIndex(getPinnedPageIndex());
  };
  
  const onPinPage = () => {
    addPinPage({
      icon: currPage.value.icon,
      title: currPage.value.title,
      link: currPage.value.link
    })
  }

  return {
    getPinnedPages,
    currPin,
    currPage,
    onPinPage,
    unpinPage,
  };
};
