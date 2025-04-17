import { useGetAllCountries } from "./useGetAllCountries";
import { useGetAllLocationTypes } from "./useGetAllLocationTypes";
import { useGetAllRegions } from "./useGetAllRegions";

export const useClientAddModalAddressInputs = () => {
  const { countries } = useGetAllCountries();
  const { regions } = useGetAllRegions();
  const { locationTypes } = useGetAllLocationTypes();

 
  return {
    regions,
    countries,
    locationTypes,
  };
};
