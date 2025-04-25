export const usePageFilter = () => {
  const pageStore = usePageStore();
  const store = usePageHeaderStore();
  const { showFilter, isIsFilterDisable } = storeToRefs(store);
  const { setIsFilterDisable, hideFilter } = store;
  const { currPage } = storeToRefs(pageStore);
  const form = ref();

  const resetForm = () => {
    form.value.reset();
    setIsFilterDisable(true);
  };

  const checkFormValidity = async () => {
    const isValid = await form.value.validate();
    setIsFilterDisable(!isValid.valid);
    if (
      currPage.value.filterInput.some((input) => input.required && !input.value)
    ) {
      setIsFilterDisable(true);
    }
  };
  watch(isIsFilterDisable, () => {
    console.log('isFilterDisable', isIsFilterDisable)
  })
  return {
    form,
    currPage,
    showFilter,
    isIsFilterDisable,
    checkFormValidity,
    hideFilter,
    resetForm,
  };
};
