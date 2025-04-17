export const usePageFilter = () => {
  const store = usePageHeaderStore();
  const pageStore = usePageStore();
  const { hideFilter } = usePageHeaderStore();
  const { showFilter, isFilterDisable } = storeToRefs(store);
  const { currPage } = storeToRefs(pageStore);
  const form = ref();

  const resetForm = () => {
    form.value.reset();
    store.isFilterDisable = true;
  };

  const checkFormValidity = async () => {
    const isValid = await form.value.validate();
    store.isFilterDisable = !isValid.valid;
    if (
      currPage.value.filterInput.some((input) => input.required && !input.value)
    ) {
      store.isFilterDisable = true;
    }
  };

  return {
    form,
    currPage,
    showFilter,
    isFilterDisable,
    checkFormValidity,
    hideFilter,
    resetForm,
  };
};
