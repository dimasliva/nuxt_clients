import type { IRectsOtherDocument } from "../types/clients";

export const useClientAddModalTabDocuments = () => {
  const { t } = useI18n();

  const id = ref(0);

  const addedItems = [t("snils"), t("doc_oms"), t("doc_dms"), t("doc_other")];
  const selectType = ref<string>(t("snils"));
  const serial = ref("");
  const number = ref("");
  const when = ref("");
  const comment = ref("");
  const doLists = reactive<
    { text: string; onClick: (doc: IRectsOtherDocument) => void }[]
  >([]);

  const store = useClientModalStore();
  const { setIsEditDocument, setEditOtherDocument, addOtherDocument, removeOtherDocument } = store;
  const { userInfo, isEditDocument } = storeToRefs(store);

  const addInputs = () => {
    const formattedDate = new Date(when.value)
      .toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, ".");

    addOtherDocument({
      comment: comment.value,
      number: number.value,
      serial: serial.value,
      typeCode: getTypecode(selectType.value),
      when: formattedDate,
    });

    id.value++;
  };

  const getTypecode = (text: string) => {
    switch (text) {
      case t("snils"):
        return 1048577;
      case t("doc_oms"):
        return 1048578;
      case t("doc_dms"):
        return 1048579;
      case t("doc_other"):
        return 1114112;
      default:
        return 1114112;
    }
  };

  const getTypecodeText = (typecode: number) => {
    switch (typecode) {
      case 1048577:
        return t("snils");
      case 1048578:
        return t("doc_oms");
      case 1048579:
        return t("doc_dms");
      case 1114112:
        return t("doc_other");
      default:
        return '-';
    }
  };

  const editDocument = (doc: IRectsOtherDocument) => {
    setIsEditDocument(true);
    setEditOtherDocument(doc);
    console.log("Редактировать", doc);
  };

  const removeDocument = (doc: IRectsOtherDocument) => {
    console.log("Удалить", doc);
    removeOtherDocument(doc)
  };

  onMounted(() => {
    doLists.push(
      { text: "Редактировать", onClick: editDocument },
      { text: "Удалить", onClick: removeDocument }
    );
  });
  return {
    doLists,
    serial,
    number,
    when,
    comment,
    selectType,
    addedItems,
    userInfo,
    addInputs,
    removeDocument,
    getTypecodeText,
    t,
  };
};
