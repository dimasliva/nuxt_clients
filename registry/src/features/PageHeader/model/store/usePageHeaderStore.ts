export const usePageHeaderStore = defineStore("pageHeaderStore", {
  state: () => ({
    showFilter: false as boolean,
    isFilterDisable: true as boolean,
  }),
  actions: {
    toggleFilter() {
      this.showFilter = !this.showFilter;
      console.log('this.showFilter', this.showFilter)
    },
    setFilterVisibility(isVisible: boolean) {
      this.showFilter = isVisible;
    },
    setIsFilterDisable(isVisible: boolean) {
      this.isFilterDisable = isVisible;
    },
    hideFilter() {
      this.showFilter = false;
    },
  },
  getters: {
    isFilterVisible: (state) => state.showFilter,
    isIsFilterDisable: (state) => state.isFilterDisable,
  },
});
