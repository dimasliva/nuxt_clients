
export const usePinnedPage = () => {
  const pinnedStore = usePageStore();
  const { unpinPageByIndex } = usePageStore();
  const { getPinnedPages } = storeToRefs(pinnedStore);

  return {
    getPinnedPages,

    unpinPageByIndex,
  };
};
