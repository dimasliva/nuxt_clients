import type { ISeletedRow, ITableColumn, ITableRow } from "../types/pagetable";

export const usePageTable = (props: IPageTableProps) => {
  const tableElem = ref<Ref | null>(null);
  const selected = ref<string[]>([]);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const selectStrategy: TSelectStrategy = "page";
  const lineSelected = ref<string | null>(null);
  const { keys } = useTableHeader();

  const storePage = usePageStore();
  const { currPage } = storeToRefs(storePage);

  const store = useEmployeesStore();
  const { updateAppProfileParams } = storeToRefs(store);
  const { setUpdateAppProfileParams } = store;

  const { updateAppProfile } = useUpdateAppProfile();

  const pagesCount = computed(() => {
    if (props.rows.length % itemsPerPage.value === 0)
      return Math.floor(props.rows.length / itemsPerPage.value);
    else return Math.floor(props.rows.length / itemsPerPage.value) + 1;
  });

  const uniqueInitialColumns = Array.from(
    new Set(
      updateAppProfileParams.value.pageSettings[currPage.value.link].tcols
    )
  );
  const selectedColumns = reactive<string[]>(
    uniqueInitialColumns.length > 0
      ? uniqueInitialColumns
      : props.columns.map((col) => col.key)
  );

  const filteredHeaders = computed(() => {
    const res: ITableColumn[] = [];
    res.push({
      key: "actions",
      align: "center",
      width: "100px",
      sortable: false,
      title: "",
      selected: true,
    });
    selectedColumns.forEach((col) => {
      const column = props.allColumns.find((val) => val.key === col);
      if (column) {
        res.push(column);
      }
    });
    return res;
  });

  const accessibleCols = computed(() => {
    return props.allColumns
      .filter((col) => selectedColumns.includes(col.key))
      .map((col) => col.key);
  });

  const notAccessibleCols = computed(() => {
    return props.allColumns
      .map((col) => col.key)
      .filter((colKey) => !selectedColumns.includes(colKey));
  });

  const getElement = () => {
    if (tableElem.value) {
      let childrenArr = Array.from(tableElem.value.$el.children) as any[];
      return childrenArr.find((item) => item.className.includes("v-table"));
    }
    return null;
  };

  const scrollTo = (x: number, y: number) => {
    const el = getElement();
    if (el) {
      el.scroll(x, y);
    }
  };

  const onClearSelected = () => {
    selected.value.length = 0
  }

  const updateProfileParams = (isEmpty?: boolean) => {
    setUpdateAppProfileParams({
      compSettings: { ...updateAppProfileParams.value.compSettings },
      pageSettings: {
        ...updateAppProfileParams.value.pageSettings,
        [currPage.value.link]: {
          tcols: isEmpty ? [] : selectedColumns,
        },
      },
    });
  };
  const reloadSelectedColumn = () => {
    updateProfileParams();
    updateAppProfile();
  };
  function onUpdateAppProfile(isEmpty?: boolean) {
    updateProfileParams(isEmpty);
    useDebounce(updateAppProfile, 1000);
  }

  const toggleSelectColumn = (isHidden: boolean, colKey: string) => {
    const index = selectedColumns.indexOf(colKey);
    if (isHidden) {
      selectedColumns.push(colKey);
    } else {
      selectedColumns.splice(index, 1);
    }

    onUpdateAppProfile();
  };

  const onRowClick = (item: ITableRow) => {
    lineSelected.value = item.id;
  };

  const onClickThreeDots = (id: string) => {
    lineSelected.value = id;
  };

  const getActionsMenu = (item: any) => {
    return props.tableDescr.actionsMenu ? props.tableDescr.actionsMenu() : [];
  };

  const getDataAlignClass = (columnKey: string) => {
    const column = props.allColumns.find((col) => col.key === columnKey);
    let classes: string[] = [];
    classes.push(columnKey === keys.snils ? "max-w-32" : "");
    classes.push(columnKey === keys.birthdate ? "w-22" : "");
    classes.push(columnKey === keys.fio ? "max-w-80" : "");
    classes.push("truncate");
    classes.push(column ? column.align : "start");
    return classes.join(" ");
  };

  const formatRowText = (key: string, text: string) => {
    if (key === keys.mainPhone) {
      return formatPhoneNumber(text);
    }
    if (key === keys.birthdate) {
      return formatDateToddMMyyyy(text);
    }
    return text;
  };

  const rowsToSelectViewDictVal = (): ISeletedRow[] => {
    return selected.value
      .map((v) => {
        const obj = props.rows.find((row) => row.id === v);
        return obj ? { value: v, title: obj.fio } : null;
      })
      .filter((row): row is ISeletedRow => row !== null);
  };
  

  const onItemsPerPageChange = (newValue: number) => {
    itemsPerPage.value = newValue;
  };

  const resetSelectedColumns = () => {
    selectedColumns.length = 0;
    onUpdateAppProfile(true);
  };

  watch(
    props.columns,
    () => {
      if (
        !updateAppProfileParams.value.pageSettings[currPage.value.link].tcols
      ) {
        selectedColumns.push(...props.columns.map((col) => col.key));
      }
    },
    { immediate: true }
  );

  return {
    selected,
    tableElem,
    pagesCount,
    currentPage,
    lineSelected,
    itemsPerPage,
    accessibleCols,
    selectStrategy,
    filteredHeaders,
    selectedColumns,
    notAccessibleCols,
    scrollTo,
    onRowClick,
    formatRowText,
    getActionsMenu,
    onClearSelected,
    onClickThreeDots,
    getDataAlignClass,
    toggleSelectColumn,
    reloadSelectedColumn,
    onItemsPerPageChange,
    resetSelectedColumns,
    rowsToSelectViewDictVal,
  };
};
