import { EAddressTabs, type IActualAddress } from "../types/clients";

export const useClientAddModalTabAddress = () => {
    
    const activeTab = ref(EAddressTabs.actual); 
    const address = reactive<IActualAddress>({
        county: "",
        region: "",
        municipalDistrict: "",
        localityType: "",
        localityName: "",
        postalCode: "",
        street: "",
        house: "",
        building: "",        
        apartment: "",       
    }); 
    

    return {
        address,
        activeTab
    }
}