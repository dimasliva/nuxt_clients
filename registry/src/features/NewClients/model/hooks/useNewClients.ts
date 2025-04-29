import type {
  ITableDescription,
  ITableRow,
} from "~/src/widgets/PageTable/model/types/pagetable";
import { useGetClients } from "./useGetClients";
import { useQueryClient } from "@tanstack/vue-query";

export const useNewClients = () => {
  const selectedTitleCol = ref<string>("fio");
  const isOpenAddModal = ref<boolean>(false);
  const openDeleteConfirmModal = reactive<IConfirmModal>({
    id: "",
    isOpen: false,
    value: "",
  });

  const { tableData } = useGetClients();

  const store = useClientModalStore();
  const {
    userInfo,
    openUserId,
    getIsContactsChanged,
    getIsDocumentsChanged,
    getIsClientChanged,
    getIsAddressesChanged,
    getIsAvatarChanged,
  } = storeToRefs(store);

  const {
    resetUserInfo,
    setDefaultActiveTab,
    setOpenUserId,
    setUserInfo,
    formatRecordResponse,
    setDefaultUserData,
    setFIOData,
  } = store;

  const tableStore = useClientTableStore();
  const { setTableFilter } = tableStore;

  const { setCurrentPage } = usePageStore();

  const { addBtnPage, filterBtnPage, updateBtnPage } = useButtons();
  const { emailRules, phoneRules, snilsRules, fioRules } = useRules();

  const { updateClient } = useUpdateClient();
  const { uploadFile } = useUploadFile();
  const { deleteClient, isPendingDeleteClient } = useDeleteClient();
  const { updateClientContacts } = useUpdateClientContacts();
  const { updateSetClientSd } = useSetClientSd();
  const { updateSetClientDocuments } = useSetClientDocuments();
  const { updateSetClientAddresses } = useSetClientAddresses();
  const { addClient, isPendingAddClient } = useAddClient();
  const { refetch: refetchGetClientRecords } = useGetClientRecords();
  const queryClient = useQueryClient();

  const getClients = () => {
    queryClient.invalidateQueries({
      queryKey: ["get clients"],
    });
  };

  const getClientModalData = async () => {
    const clientResponse = await refetchGetClient();
    if (clientResponse.data) {
      if (clientResponse.data.result[0]) {
        setFIOData(clientResponse.data.result[0]);
      }
    }

    const response = await refetchGetClientRecords();
    if (response.data) {
      setUserInfo(formatRecordResponse(response.data.result));
    }
  };

  function updateAddressHandler() {
    if (getIsAddressesChanged.value) {
      updateSetClientAddresses();
    }
  }

  function updateContactsHandler() {
    if (getIsContactsChanged.value) {
      updateClientContacts();
    }
  }

  function updateDocumentsHandler() {
    if (getIsDocumentsChanged.value) {
      updateSetClientDocuments();
    }
  }

  function updateClientHandler() {
    if (getIsClientChanged.value) {
      updateClient();
    }
  }

  const updateAvatarHandler = () => {
    if (getIsAvatarChanged.value) {
      if (userInfo.value.avatarPreview) {
        uploadFile();
      } else if (userInfo.value.documents.changedAt !== "") {
        updateSetClientSd();
      }
    }
  };

  async function updateUserInfo() {
    updateClientHandler();
    updateAvatarHandler();
    updateContactsHandler();
    updateDocumentsHandler();
    updateAddressHandler();
  }

  const saveAddModal = async () => {
    await updateUserInfo();
    // getClientModalData();
    setDefaultUserData();
    getClients();
  };

  const { refetch: refetchGetClient } = useGetClient();

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
    getClientModalData();
  }

  addBtnPage.action = () => {
    resetUserInfo();
    openModal();
  };

  updateBtnPage.action = () => {
    getClients();
  };

  const onFilterTable = (inputs: IFilterInputValue[]) => {
    let whereValues = {
      [EFilterInputValueKey.fio]: "",
      [EFilterInputValueKey.birthdate]: "",
      [EFilterInputValueKey.mainEmail]: "",
      [EFilterInputValueKey.mainPhone]: "",
      [EFilterInputValueKey.snils]: "",
    };

    inputs.forEach((val) => {
      whereValues[val.key] = val.value || "";
    });

    const [surname = "", name = "", patronymic = ""] =
      whereValues[EFilterInputValueKey.fio].split(" ");
    const birthdate = whereValues[EFilterInputValueKey.birthdate];
    const mainEmail = whereValues[EFilterInputValueKey.mainEmail];
    const mainPhone = whereValues[EFilterInputValueKey.mainPhone];
    const snils = whereValues[EFilterInputValueKey.snils];

    const conditions: string[] = [];
    if (surname) conditions.push(`surname like '${surname}%'`);
    if (name) conditions.push(`name like '${name}%'`);
    if (patronymic) conditions.push(`patronymic like '${patronymic}%'`);
    if (birthdate) conditions.push(`birthdate='${birthdate}'`);
    if (mainPhone) conditions.push(`mainPhone='${mainPhone}'`);
    if (mainEmail) conditions.push(`mainEmail='${mainEmail}'`);
    if (snils) conditions.push(`snils='${snils}'`);

    const whereClause = conditions.length
      ? conditions.join(" and ")
      : "changedAt <= '3000-01-01'";

    let filterParams: IClientParams = {
      limit: 0,
      orderBy: "changedAt desc",
      select:
        "id,name,surname,patronymic,birthdate,gender,mainPhone,mainEmail,snils",
      where: whereClause,
    };

    setTableFilter(filterParams);
    getClients();
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
    onFilter: onFilterTable,
    filterInput: [
      {
        type: EInputTypes.text,
        title: "ФИО",
        input: { key: EFilterInputValueKey.fio, value: "" },
        required: true,
        rules: fioRules,
        constraints: { min: 2, max: 100 },
      },
      {
        type: EInputTypes.date,
        title: "Дата рождения",
        input: { key: EFilterInputValueKey.birthdate, value: "" },
        required: true,
        rules: [],
        constraints: { min: 2, max: 100 },
      },
      {
        type: EInputTypes.email,
        title: "Электронная почта",
        input: { key: EFilterInputValueKey.mainEmail, value: "" },
        rules: [emailRules.email],
        constraints: { min: 0, max: 254 },
      },
      {
        type: EInputTypes.phone,
        title: "Телефон",
        input: { key: EFilterInputValueKey.mainPhone, value: "" },
        rules: phoneRules,
        constraints: { min: 0, max: 11 },
      },
      {
        type: EInputTypes.text,
        title: "СНИЛС",
        input: { key: EFilterInputValueKey.snils, value: "" },
        rules: snilsRules,
        constraints: { min: 0, max: 11 },
      },
    ],
  };

  setCurrentPage(currentPage);

  const onConfirmDelete = () => {
    deleteClient(openDeleteConfirmModal.id);
    getClients();
  };
  const onCancelDeleteModal = () => {
    openDeleteConfirmModal.id = "";
    openDeleteConfirmModal.isOpen = false;
    openDeleteConfirmModal.value = "";
  }

  const tableDescr: ITableDescription = {
    headers: tableData.columns,
    actionsMenu: () => [
      {
        id: "open",
        title: "Изменить",
        icon: "mdi-square-edit-outline",
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
        action: async (selectedItem: ITableRow) => {
          openDeleteConfirmModal.id = selectedItem.id;
          openDeleteConfirmModal.isOpen = true;
          openDeleteConfirmModal.value = selectedItem.fio;
          return "";
        },
        disabled: false,
      },
    ],
  };

  watch(isPendingAddClient, async () => {
    if (!isPendingAddClient.value && openUserId.value !== "-1") {
      updateAvatarHandler();
      updateAddressHandler();
      updateContactsHandler();
      updateDocumentsHandler();

      getClientModalData();
    }
  });

  watch(isPendingDeleteClient, () => {
    if(!isPendingDeleteClient.value && openDeleteConfirmModal.isOpen) {
      onCancelDeleteModal()
    }
  })

  return {
    tableData,
    tableDescr,
    isOpenAddModal,
    allTableColumns,
    selectedTitleCol,
    isPendingDeleteClient,
    openDeleteConfirmModal,
    openModal,
    onAddModal,
    saveAddModal,
    onRowClicked,
    closeAddModal,
    onConfirmDelete,
    onAddAndCloseModal,
    onCancelDeleteModal,
  };
};
