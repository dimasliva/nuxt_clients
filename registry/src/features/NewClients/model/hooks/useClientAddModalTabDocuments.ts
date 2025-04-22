import type { IOtherDocument } from "../types/clients";

export const useClientAddModalTabDocuments = () => {
  const { t } = useI18n();

  const id = ref(0);
  
  const documents = reactive<IOtherDocument[]>([]);
  const addedItems = [t("snils"), t("doc_oms"), t("doc_dms"), t("doc_other")];
  const selectType = ref<string>(t("snils"));
  const seria = ref('');
  const number = ref('');
  const date = ref('');
  const comment = ref('');

  const store = useClientModalStore();
  const { userInfo } = storeToRefs(store);
  
  const addInputs = () => {
    const formattedDate = new Date(date.value).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).replace(/\//g, '.');
    documents.push({
      id: id.value,
      title: selectType.value,
      comment: comment.value,
      date: formattedDate,
      number: number.value,
      seria: seria.value,
    });
    id.value++;
  };

  const removeDocument = (index: number) => {
    documents.splice(index, 1); 
  };

  watch(date, () => {
    console.log(date.value);
  })

  return {
    seria,
    number,
    date,
    comment,
    selectType,
    documents,
    addedItems,
    userInfo,
    removeDocument,
    addInputs,
    t,
  };
};
