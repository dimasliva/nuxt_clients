import type {
  IOpenTableRow,
  ITableDescription,
} from "~/src/widgets/PageTable/model/types/pagetable";
import { useGetClients } from "./useGetClients";
import type { IOpenUserId } from "../types/clients";

export const useNewClients = () => {
  const fioInput = ref<string>("");
  const emailInput = ref<string>("");
  const phoneInput = ref<string>("");
  const snilsInput = ref<string>("");
  const selectedTitleCol = ref<string>("fio");
  const isOpenAddModal = ref<boolean>(false);
  const openUserId = ref<IOpenUserId>(null);

  const { tableData, isPending } = useGetClients();
  
  const store = useClientModalStore();
  const { resetUserInfo } = store
  
  const pageStore = usePageStore();
  const { setCurrentPage } = usePageStore();
  const {} = storeToRefs(pageStore);

  const { addBtnPage, filterBtnPage, updateBtnPage } = useButtons();
  const { emailRules, phoneRules, snilsRules, fioRules } = useRules();

  addBtnPage.action = () => {
    resetUserInfo()
    isOpenAddModal.value = true;
  };

  updateBtnPage.action = () => {
    console.log(111);
  };
  const {
    nameColumn,
    surnameColumn,
    patronymicColumn,
    birthdateColumn,
    genderColumn,
    mainPhoneColumn,
    mainEmailColumn,
    snilsColumn,
  } = useTableHeader();

  const allTableColumns = [
    nameColumn,
    surnameColumn,
    patronymicColumn,
    birthdateColumn,
    genderColumn,
    mainPhoneColumn,
    mainEmailColumn,
    snilsColumn,
  ];

  console.log("tableData.columns", tableData.columns);

  const btns = [updateBtnPage, addBtnPage, filterBtnPage];

  const currentPage: IPage = {
    title: "Клиенты",
    link: "/list/new/clients",
    icon: "mdi-account-multiple-plus-outline",
    btns: btns,
    filterInput: [
      {
        type: EInputTypes.text,
        title: "ФИО",
        value: fioInput,
        required: true,
        rules: fioRules,
        constraints: { min: 2, max: 100 },
      },
      {
        type: EInputTypes.email,
        title: "Электронная почта",
        value: emailInput,
        rules: [emailRules.email],
        constraints: { min: 0, max: 254 },
      },
      {
        type: EInputTypes.phone,
        title: "Телефон",
        value: phoneInput,
        rules: phoneRules,
        constraints: { min: 0, max: 11 },
      },
      {
        type: EInputTypes.text,
        title: "СНИЛС",
        value: snilsInput,
        rules: snilsRules,
        constraints: { min: 0, max: 11 },
      },
    ],
  };

  setCurrentPage(currentPage);

  const tableDescr: ITableDescription = {
    headers: tableData.columns,
    actionsMenu: (selectedItem: IOpenTableRow) => [
      {
        id: "open",
        title: "Открыть",
        icon: "mdi-eye-outline",
        action: (selectedItem: IOpenTableRow) => {
          openUserId.value = selectedItem.value;
          isOpenAddModal.value = true;
          console.log("Open item:", selectedItem);
          return "";
        },
        disabled: false,
      },
      {
        id: "edit",
        title: "Изменить",
        icon: "mdi-pencil",
        action: (selectedItem: IOpenTableRow) => {
          openUserId.value = selectedItem.value;
          isOpenAddModal.value = true;
          return "";
        },
        disabled: false,
      },
      {
        id: "delete",
        title: "Удалить",
        icon: "mdi-delete",
        action: (selectedItem: IOpenTableRow) => {
          console.log("Deleting item:", selectedItem);
          return "";
        },
        disabled: false,
      },
    ],
  };

  const closeAddModal = () => {
    isOpenAddModal.value = false;
    console.log("isOpenAddModal.value", isOpenAddModal.value);
  };

  return {
    openUserId,
    tableData,
    tableDescr,
    isOpenAddModal,
    allTableColumns,
    selectedTitleCol,
    closeAddModal,
  };
};
