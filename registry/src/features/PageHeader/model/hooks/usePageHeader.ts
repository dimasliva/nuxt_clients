export const usePageHeader = () => {
  const store = usePageStore();
  const { unpinPageByIndex, getPinnedPageIndex, addPinPage } = store;
  const { getPinnedPages, getCurrPin, currPage } = storeToRefs(store);

  const unpinPage = () => {
    unpinPageByIndex(getPinnedPageIndex());
  };

  const onPinPage = () => {
    addPinPage({
      icon: currPage.value.icon,
      title: currPage.value.title,
      link: currPage.value.link,
    });
  };

  return {
    getPinnedPages,
    getCurrPin,
    currPage,
    onPinPage,
    unpinPage,
  };
};
