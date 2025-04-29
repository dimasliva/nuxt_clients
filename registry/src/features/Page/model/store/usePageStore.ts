import { useCookie } from "#app";

export const usePageStore = defineStore("pageStore", {
  state: () => {
    const pinnedPagesCookie = useCookie<IPinPage[]>("pinnedPages", {
      default: () => [],
    });

    return {
      pages: [] as IPage[],
      currPage: {} as IPage,
      currPin: true as boolean,
      pinnedPages: pinnedPagesCookie.value,
    };
  },
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
      this.syncPinnedPagesCookie();
      this.updatePinCurrPage();
    },
    unpinPageByIndex(index: number) {
      this.pinnedPages.splice(index, 1);
      this.syncPinnedPagesCookie();
      this.updatePinCurrPage();
    },
    updatePinCurrPage() {
      this.currPin = !this.pinnedPages.find(
        (e) => e.title === this.currPage.title
      );
    },
    getPinnedPageIndex() {
      return this.pinnedPages.findIndex((e) => e.title === this.currPage.title);
    },
    setCurrentPage(val: IPage) {
      this.currPage = val;
    },
    syncPinnedPagesCookie() {
      const cookie = useCookie<IPinPage[]>("pinnedPages");
      cookie.value = this.pinnedPages;
    },
  },
  getters: {
    getPinnedPages: (state) => state.pinnedPages,
    getCurrPageTitle: (state) => state.currPage,
    getCurrPin: (state) => {
      const cookie = useCookie<IPinPage[]>("pinnedPages");
      if (cookie.value) {
        const foundPage = cookie.value.find(
          (c) => c.title === state.currPage.title
        );
        return foundPage === undefined;
      }
      return true;
    },
  },
});
