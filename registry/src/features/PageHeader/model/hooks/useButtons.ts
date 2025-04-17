
export const useButtons = () => {
    const { t } = useI18n();
    const { toggleFilter } = usePageHeaderStore();
    
    const updateBtnPage  = {
        id: "update",
        title: t("update"),
        icon: "mdi-autorenew",
        disabled: false,
        color: "primary",
        bkgColor: "blue",
        action: () => {},
        // action: () => this.updateData(),
      }
    
     const addBtnPage = {
        id: "addClient",
        title: t("add"),
        icon: "mdi-account",
        disabled: false,
        color: "primary",
        bkgColor: "red",
        action: () => {},
        // action: () => this.add(),
      }
    
       const filterBtnPage = {
        id: "filter",
        title: "",
        icon: "mdi-magnify",
        disabled: false,
        color: "primary",
        bkgColor: "red",
        // action: () => {
        //   this.refFilterForm.value.toggleVis();
        // },
        action: toggleFilter,
    
      }
    return {
        updateBtnPage,
        addBtnPage,
        filterBtnPage,
    }
}

