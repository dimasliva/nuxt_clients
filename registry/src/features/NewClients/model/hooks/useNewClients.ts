import type {
  ITableDescription,
  ITableRow,
} from "~/src/widgets/PageTable/model/types/pagetable";
import { useGetClients } from "./useGetClients";
import { useUpdateClientAvatar } from "./useUpdateClientAvatar";
import { useUpdateClientContacts } from "./useUpdateClientContacts";
import { useSetClientSd } from "./useSetClientSd";
import { useSetClientAddresses } from "./useSetClientAddresses";
import { useAddClient } from "./useAddClient";

export const useNewClients = () => {
  const fioInput = ref<string>("");
  const emailInput = ref<string>("");
  const phoneInput = ref<string>("");
  const snilsInput = ref<string>("");
  const selectedTitleCol = ref<string>("fio");
  const isOpenAddModal = ref<boolean>(false);

  const { tableData } = useGetClients();

  const store = useClientModalStore();
  const { userInfo } = storeToRefs(store);
  const { resetUserInfo, setDefaultActiveTab, setOpenUserId } = store;

  const pageStore = usePageStore();
  const { setCurrentPage } = usePageStore();
  const {} = storeToRefs(pageStore);

  const { addBtnPage, filterBtnPage, updateBtnPage } = useButtons();
  const { emailRules, phoneRules, snilsRules, fioRules } = useRules();

  const { updateClient } = useUpdateClient();
  const { updateClientAvatar } = useUpdateClientAvatar();
  const { updateClientContacts } = useUpdateClientContacts();
  const { updateSetClientSd } = useSetClientSd();
  const { updateSetClientDocuments } = useSetClientDocuments();
  const { updateSetClientAddresses } = useSetClientAddresses();
  const { addClient } = useAddClient();

  const saveAddModal = () => {
    updateUserInfo();
  };

  function updateUserInfo() {
    updateClient();
    if (userInfo.value.avatarPreview) {
      updateClientAvatar();
    } else if (userInfo.value.documents.changedAt !== "") {
      updateSetClientSd();
    }
    updateClientContacts();
    updateSetClientDocuments();
    if (userInfo.value.addresses.changedAt !== "") {
      updateSetClientAddresses();
    }
  }

  const closeAddModal = () => {
    isOpenAddModal.value = false;
  };

  const onAddModal = () => {
    addClient();
  };

  const onAddAndCloseModal = () => {
    addClient();
    closeAddModal();
  };

  function onRowClicked(id: string) {
    setOpenUserId(id);
    openModal();
  }

  function openModal() {
    setDefaultActiveTab();
    isOpenAddModal.value = true;
  }

  addBtnPage.action = () => {
    resetUserInfo();
    openModal();
  };

  updateBtnPage.action = () => {
    console.log(111);
  };
  const {
    fioColumn,
    birthdateColumn,
    genderColumn,
    mainPhoneColumn,
    mainEmailColumn,
    snilsColumn,
  } = useTableHeader();

  const allTableColumns = [
    fioColumn,
    birthdateColumn,
    genderColumn,
    mainPhoneColumn,
    mainEmailColumn,
    snilsColumn,
  ];

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
    actionsMenu: () => [
      {
        id: "open",
        title: "Изменить",
        icon: "mdi-pencil",
        action: (selectedItem: ITableRow) => {
          setOpenUserId(selectedItem.id);
          openModal();
          return "";
        },
        disabled: false,
      },
      {
        id: "delete",
        title: "Удалить",
        icon: "mdi-delete",
        action: (selectedItem: ITableRow) => {
          console.log("Deleting item:", selectedItem);
          return "";
        },
        disabled: false,
      },
    ],
  };

  return {
    tableData,
    tableDescr,
    isOpenAddModal,
    allTableColumns,
    selectedTitleCol,
    closeAddModal,
    saveAddModal,
    openModal,
    onRowClicked,
    onAddModal,
    onAddAndCloseModal,
  };
};
