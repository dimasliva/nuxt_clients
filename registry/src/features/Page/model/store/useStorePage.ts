import type { IPinPage } from "../types/page";

export const usePageStore = defineStore("pageStore", {
  state: () => ({
    pages: [] as IPage[],
    currPage: {} as IPage,
    currPin: true as boolean,
    pinnedPages: [] as IPinPage[],
  }),
  actions: {
    addPinPage(val: IPinPage) {
      const exists = this.pinnedPages.some((page) => page.title === val.title);
      if (exists) {
        this.pinnedPages = this.pinnedPages.filter(
          (page) => page.title !== val.title
        );
      } else {
        this.pinnedPages.push(val);
      }
      this.updatePinCurrPage();
    },
    unpinPageByIndex(index: number) {
      this.pinnedPages.splice(index, 1);
      this.updatePinCurrPage();
    },

    updatePinCurrPage() {
      this.pinnedPages.find((e) => e.title == this.currPage.title)
        ? (this.currPin = false)
        : (this.currPin = true);
    },

    getPinnedPageIndex() {
      return this.pinnedPages.findIndex((e) => e.title == this.currPage.title);
    },
    setCurrentPage(val: IPage) {
      this.currPage = val;
    },
  },

  getters: {
    getPinnedPages: (state) => state.pinnedPages,
    getCurrPageTitle: (state) => state.currPage,
    getCurrPin: (state) => state.currPin,
  },
});
