import { EAddressTabs } from "../types/clients";

export const useClientAddModalTabAddress = () => {
    const activeTab = ref(EAddressTabs.actual); 
    const store = useClientModalStore();
    const { userInfo } = storeToRefs(store);

    return {
        activeTab,
        userInfo
    }
}