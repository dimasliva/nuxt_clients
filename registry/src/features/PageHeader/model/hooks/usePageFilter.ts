export const usePageFilter = () => {
  const pageStore = usePageStore();
  const store = usePageHeaderStore();
  const { showFilter, isIsFilterDisable } = storeToRefs(store);
  const { setIsFilterDisable, hideFilter } = store;
  const { currPage } = storeToRefs(pageStore);
  const form = ref();

  const onFilterSubmit = () => {
    currPage.value.onFilter(currPage.value.filterInput.map(val => {
      if (val.type === EInputTypes.date && val.input.value) {
        const date = new Date(val.input.value);
        const formattedDate = date.toISOString().split('T')[0];
        return { ...val.input, value: formattedDate };
      }
      return val.input;
    }));
  }
  

  const resetForm = () => {
    form.value.reset();
    currPage.value.onFilter(currPage.value.filterInput.map(val => ({...val.input})))
  };

  const checkFormValidity = async () => {
    const isValid = await form.value.validate();
    let inputValid = true;
    currPage.value.filterInput.forEach(val => {
      
      if(val.input.value && val.input.value.length > 0) {
        inputValid = false;
      }
    })
    console.log('inputValid', inputValid)
    if(inputValid) {
      setIsFilterDisable(true);
      return
    }
    setIsFilterDisable(!isValid.valid);
  };

  return {
    form,
    currPage,
    showFilter,
    isIsFilterDisable,
    checkFormValidity,
    onFilterSubmit,
    hideFilter,
    resetForm,
  };
};
