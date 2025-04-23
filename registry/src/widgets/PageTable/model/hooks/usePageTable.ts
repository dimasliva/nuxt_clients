import type { ITableColumn, ITableRow } from "../types/pagetable";

export const usePageTable = (props: IPageTableProps) => {
  const tableElem = ref<Ref | null>(null);
  const selected = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const selectStrategy: TSelectStrategy = "page";
  const lineSelected = ref<string | null>(null);

  const pagesCount = computed(() => {
    if (props.rows.length % itemsPerPage.value === 0)
      return Math.floor(props.rows.length / itemsPerPage.value);
    else return Math.floor(props.rows.length / itemsPerPage.value) + 1;
  });

  const accessibleColItems = computed(() => {
    return props.allColumns;
  });
  const _headers = computed(() => {
    const res: ITableColumn[] = [];
    res.push({
      key: "actions",
      align: "start",
      width: "10",
      sortable: false,
      title: "",
      selected: true,
    });
    props.allColumns.forEach((col) => {
      if (selectedColumns.value.includes(col.key)) {
        res.push(col);
      }
    });

    return res;
  });

  const selectedColumns = ref<string[]>(props.columns.map((col) => col.key));
  const accessibleCols = computed(() => {
    return props.allColumns
      .filter((col) => selectedColumns.value.includes(col.key))
      .map((col) => col.key);
  });

  const notAccessibleCols = computed(() => {
    return props.allColumns
      .map((col) => col.key)
      .filter((colKey) => !selectedColumns.value.includes(colKey));
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

  const toggleSelectColumn = (isHidden: boolean, colName: string) => {
    const index = selectedColumns.value.indexOf(colName);
    if (isHidden) {
      selectedColumns.value.push(colName);
    } else {
      selectedColumns.value.splice(index, 1);
    }
  };

  const onRowClick = (item: ITableRow) => {
    lineSelected.value = item.id;
  };
  
  const onClickThreeDots = (id: string) => {
    lineSelected.value = id
  };
  const getActionsMenu = (item: any) => {
    return props.tableDescr.actionsMenu
      ? props.tableDescr.actionsMenu(item)
      : [];
  };

  const getDataAlignClass = (columnKey: string) => {
    const column = props.allColumns.find((col) => col.key === columnKey);
    return column ? column.align : "start";
  };

  const rowsToSelectViewDictVal = () => {
    return selected.value.map((v) => {
      let obj = props.rows.find((row) => row.id === v)
      let title = obj?.fio || 'ФИО не указан';
  
      return { value: v, title: title };
    });
  };

  const onItemsPerPageChange = (newValue: number) => {
    itemsPerPage.value = newValue;
  };

  const resetSelectedColumns = () => {
    selectedColumns.value = [];
  };
  
  watchEffect(() => {
    selectedColumns.value = props.columns.map((col) => col.key);
  });

  return {
    tableElem,
    selected,
    currentPage,
    itemsPerPage,
    selectStrategy,
    _headers,
    accessibleColItems,
    selectedColumns,
    lineSelected,
    accessibleCols,
    notAccessibleCols,
    pagesCount,
    rowsToSelectViewDictVal,
    scrollTo,
    resetSelectedColumns,
    onRowClick,
    getActionsMenu,
    getDataAlignClass,
    toggleSelectColumn,
    onItemsPerPageChange,
    onClickThreeDots,
  };
};
