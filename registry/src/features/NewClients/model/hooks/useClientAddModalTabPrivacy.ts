import { ClientDocumentTypes } from "../constants/clients";
import { useGetClientDocuments } from "./useGetClientDocuments";

export const useClientAddModalTabPrivacy = () => {
  const store = useClientModalStore();
  const { userInfo } = storeToRefs(store);
  const { documents } = useGetClientDocuments();
  const {numberRules} = useRules()

  return {
    ClientDocumentTypes,
    documents,
    userInfo,
    numberRules,
  };
};
