import { EAddressTabs } from "../types/clients";

export const useClientAddModalTabAddress = () => {
    const activeTab = ref(EAddressTabs.actual); 
    
    return {
        activeTab,
    }
}