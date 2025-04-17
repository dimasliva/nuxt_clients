import { useSidebarStore } from "../../../Sidebar/model/store/useSidebarStore"

export const useNavbar = () => {
    const user = getUserFromStorage()
    const {toggleSidebar} = useSidebarStore()

    return {
        user,
        toggleSidebar,
    }
}