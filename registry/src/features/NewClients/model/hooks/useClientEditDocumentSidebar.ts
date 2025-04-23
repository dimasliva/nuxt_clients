export const useClientEditDocumentSidebar = () => {
  const { t } = useI18n();

  const store = useClientModalStore();
  const { isEditDocument, editOtherDocument } = storeToRefs(store);
  
  const {setIsEditDocument, updateOtherDocumentByEdit} = store
  const {updateSetClientDocuments} = useSetClientDocuments()

  const valid = ref<boolean>(true);

  const { numberRules, textRules } = useRules();

  function onSave() {
    updateSetClientDocuments()
    updateOtherDocumentByEdit(editOtherDocument.value)
    onClose()
  }

  function onClose() {
    setIsEditDocument(false);
  }

  return {
    valid,
    textRules,
    numberRules,
    isEditDocument,
    editOtherDocument,
    t,
    onClose,
    onSave,
  };
};
