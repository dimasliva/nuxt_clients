import type { ITableColumn, ITableRow } from "../types/pagetable";

export const usePageTable = (props: IPageTableProps) => {
  const tableElem = ref<Ref | null>(null);
  const selected = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const selectStrategy: TSelectStrategy = "page";
  const lineSelected = ref<string | null>(null);
  const {keys} = useTableHeader()

  const pagesCount = computed(() => {
    if (props.rows.length % itemsPerPage.value === 0)
      return Math.floor(props.rows.length / itemsPerPage.value);
    else return Math.floor(props.rows.length / itemsPerPage.value) + 1;
  });

  const selectedColumns = reactive<string[]>(props.columns.map((col) => col.key));
  
  const _headers = computed(() => {
    const res: ITableColumn[] = [];

    props.allColumns.forEach((col) => {
      if (selectedColumns.includes(col.key)) {
        res.push(col);
      }
    });
    res.push({
      key: "actions",
      align: "start",
      width: "100px",
      sortable: false,
      title: "",
      selected: true,
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

  const toggleSelectColumn = (isHidden: boolean, colName: string) => {
    const index = selectedColumns.indexOf(colName);
    if (isHidden) {
      selectedColumns.push(colName);
    } else {
      selectedColumns.splice(index, 1);
    }
  };

  const onRowClick = (item: ITableRow) => {
    lineSelected.value = item.id;
  };
  
  const onClickThreeDots = (id: string) => {
    lineSelected.value = id
  };
  const getActionsMenu = (item: any) => {
    // item
    return props.tableDescr.actionsMenu
      ? props.tableDescr.actionsMenu()
      : [];
  };

  const getDataAlignClass = (columnKey: string) => {
    const column = props.allColumns.find((col) => col.key === columnKey);
    let classes: string[] = []
    classes.push(columnKey === keys.snils ? 'max-w-32': '')
    classes.push(columnKey === keys.birthdate ? 'w-22': '')
    classes.push(columnKey === keys.fio ? 'max-w-10': '')
    classes.push('truncate')
    classes.push(column ? column.align : "start") 
    return classes.join(' ');
  };

  const formatRowText = (key: string, text: string) => {
    if(key === keys.mainPhone) {
      return formatPhoneNumber(text)
    }
    if(key === keys.birthdate) {
      return formatDateToddMMyyyy(text)
    }
    return text
    console.log("key", key)
  }

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
    selectedColumns.length = 0;
  };
  
  watchEffect(() => {
    selectedColumns.push(...props.columns.map((col) => col.key));
  });

  return {
    tableElem,
    selected,
    currentPage,
    itemsPerPage,
    selectStrategy,
    _headers,
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
    formatRowText,
    onClickThreeDots,
  };
};
