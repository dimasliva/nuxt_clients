export const useSidebarStore = defineStore('sidebarStore', {
    state: () => ({
        isSidebarOpen: false, 
        prevIsSidebarOpen: false, 
    }),
    actions: {
        setSidebar(val: boolean) {
            this.isSidebarOpen = val
        },
        setPrevSidebar(val: boolean) {
            this.prevIsSidebarOpen = val
        },
        toggleSidebar() {
            this.isSidebarOpen = !this.isSidebarOpen; 
        },
        openSidebar() {
            this.isSidebarOpen = true; 
        },
        closeSidebar() {
            this.isSidebarOpen = false; 
        },
    },
    getters: {
        isSidebarVisible: (state) => state.isSidebarOpen, 
        isPrevSidebarVisible: (state) => state.prevIsSidebarOpen, 
    },
});
