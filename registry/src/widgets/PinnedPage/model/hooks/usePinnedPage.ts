
export const usePinnedPage = () => {
  const pinnedStore = usePageStore();
  const { unpinPageByIndex } = pinnedStore
  const { getPinnedPages } = storeToRefs(pinnedStore);

  return {
    getPinnedPages,

    unpinPageByIndex,
  };
};
