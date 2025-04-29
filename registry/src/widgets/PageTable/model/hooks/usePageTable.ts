import type { ITableColumn, ITableRow } from "../types/pagetable";
import { useCookie } from "#app";
import { ref, reactive, computed, watch } from "vue";

export const usePageTable = (props: IPageTableProps) => {
  const tableElem = ref<Ref | null>(null);
  const selected = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const selectStrategy: TSelectStrategy = "page";
  const lineSelected = ref<string | null>(null);
  const { keys } = useTableHeader();

  const store = useEmployeesStore();
  const { updateAppProfileParams } = storeToRefs(store);
  const { setUpdateAppProfileParams } = store;

  const { updateAppProfile } = useUpdateAppProfile();

  const pagesCount = computed(() => {
    if (props.rows.length % itemsPerPage.value === 0)
      return Math.floor(props.rows.length / itemsPerPage.value);
    else return Math.floor(props.rows.length / itemsPerPage.value) + 1;
  });

  const cookie = useCookie<string>("selectedColumns");
  console.log("cookie", cookie.value);

  // Попробуем безопасно разобрать значение куки

  // Удаляем дубликаты из массива
  const uniqueInitialColumns = Array.from(new Set(cookie.value));
  const selectedColumns = reactive<string[]>(
    uniqueInitialColumns.length > 0
      ? uniqueInitialColumns
      : props.columns.map((col) => col.key)
  );

  const _headers = computed(() => {
    const res: ITableColumn[] = [];
    res.push({
      key: "actions",
      align: "center",
      width: "100px",
      sortable: false,
      title: "",
      selected: true,
    });
    props.allColumns.forEach((col) => {
      if (selectedColumns.includes(col.key)) {
        res.push(col);
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

  function onUpdateAppProfile() {
    console.log("selectedColumns", selectedColumns);
    setUpdateAppProfileParams({
      compSettings: {},
      pageSettings: {
        "/list/new/clients": {
          tcols: ["fio", "bd", "mainPhone", "mainEmail", "gen"],
        },
      },
    });
    updateAppProfile();
  }

  const toggleSelectColumn = (isHidden: boolean, colKey: string) => {
    const index = selectedColumns.indexOf(colKey);
    if (isHidden) {
      selectedColumns.push(colKey);
    } else {
      selectedColumns.splice(index, 1);
    }
    onUpdateAppProfile();

    cookie.value = JSON.stringify(Array.from(new Set(selectedColumns)));
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

  const rowsToSelectViewDictVal = () => {
    return selected.value.map((v) => {
      let obj = props.rows.find((row) => row.id === v);
      let title = obj?.fio || "ФИО не указан";

      return { value: v, title: title };
    });
  };

  const onItemsPerPageChange = (newValue: number) => {
    itemsPerPage.value = newValue;
  };

  const resetSelectedColumns = () => {
    selectedColumns.length = 0;
    cookie.value = JSON.stringify(selectedColumns);
  };

  watch(
    props.columns,
    () => {
      if (!cookie.value) {
        selectedColumns.push(...props.columns.map((col) => col.key));
        cookie.value = JSON.stringify(Array.from(new Set(selectedColumns))); // Сохраняем в куки
      }
    },
    { immediate: true }
  );

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
