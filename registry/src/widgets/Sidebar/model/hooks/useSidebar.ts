import { useDisplay } from "vuetify/lib/framework.mjs";
import { chkRights } from "~/src/common/lib/Utils";
import { toPage } from "~/src/shared/utils/useFunctions/userFunctions";
import { useSidebarStore } from "~/src/widgets/Sidebar/model/store/useSidebarStore";
import type { IModuleItemsMenu } from "../types/sidebar";
import { title } from "process";
import type { VNodeRef } from "vue";

export const useSidebar = () => {
  const { name } = useDisplay();
  let drawer = ref<boolean>(true);
  let opened = ref<string[]>([]);
  let allOpened = reactive<string[]>([]);
  let selected = ref<string[]>([]);
  let pInput = ref<VNodeRef | null>(null);
  let input = ref<string>("");
  
  const sidebarItems = reactive<IModuleItemsMenu[]>([]);
  const allChilds = reactive<IModuleItemsMenu[]>([]);
  const sidebarStore = useSidebarStore();
  const { closeSidebar, setSidebar, setPrevSidebar } = useSidebarStore();
  const { isSidebarVisible, isPrevSidebarVisible } = storeToRefs(sidebarStore);

  let drawerWidth = computed(() => {
    switch (name.value) {
      case "xs":
        return 100;
      case "sm":
        return 250;
      case "md":
        return 250;
      case "lg":
        return 350;
      case "xl":
        return 350;
      case "xxl":
        return 400;
    }
    return undefined;
  });

  let getListMenuItem = () => {
    let menuItem: IModuleItemsMenu = {
      id: "lists",
      title: "Списки",
      getPagePath: () => "",
      icon: "mdi-account-tie",
      childs: [
        {
          id: "product_catalogs",
          title: "Товары и услуги",
          getPagePath: () => "/list/product_catalogs",
          icon: "mdi-invoice-text-multiple-outline",
        },
      ],
    };

    var menuList = {
      dbClient: {
        rights: "r",
        item: {
          id: "clients",
          title: "Клиенты",
          getPagePath: () => "/list/clients",
          icon: "mdi-account-multiple",
        },
      },
      dbPosition: {
        rights: "r",
        item: {
          id: "positions",
          title: "Должности",
          getPagePath: () => "/list/positions",
          icon: "mdi-card-account-details-outline",
        },
      },
      dbDealOrder: {
        rights: "r",
        item: {
          id: "deal_orders",
          title: "Заказы",
          getPagePath: () => "/list/deal_orders",
          icon: "mdi-handshake-outline",
        },
      },
      dbDeal: {
        rights: "r",
        item: {
          id: "deals",
          title: "Сделки",
          getPagePath: () => "/list/deals",
          icon: "mdi-handshake-outline",
        },
      },
      dbScheduleItemGroup: {
        rights: "r",
        item: {
          id: "schedule_item_group",
          title: "Разделы расписания",
          getPagePath: () => "/list/schedule_item_group",
          icon: "mdi-book-clock-outline",
        },
      },
      dbCompanyOrganization: {
        rights: "r",
        item: {
          id: "company_organizations",
          title: "Организации компании",
          getPagePath: () => "/list/company_organizations",
          icon: "mdi-handshake-outline",
        },
      },
    };

    for (const key in menuList) {
      const { rights, item } = menuList[key];
      if (chkRights(null, { key: rights })) {
        menuItem.childs!.push(item);
      }
    }
    return menuItem;
  };

  let getBookingMenuItem = () => {
    return {
      id: "booking",
      title: "Предварительная запись",
      getPagePath: () => "",
      icon: "mdi-account-tie",
      childs: [
        {
          id: "journal",
          title: "ЖПЗ",
          getPagePath: () => "/booking/test_journal",
          icon: "mdi-calendar",
        },
      ],
    };
  };

  let getFilteredChapters = () => {
    let res: IModuleItemsMenu[] = [
      {
        id: "control_panel",
        title: "Панель управления",
        getPagePath: () => "/dashboard",
        icon: "mdi-view-dashboard",
      },
      {
        id: "admin_panel",
        title: "Администрирование",
        getPagePath: () => "",
        icon: "mdi-account-tie",
        childs: [
          {
            id: "employees",
            title: "Сотрудники",
            getPagePath: () => "/administration/employees",
            icon: "mdi-account-circle",
          },
          {
            id: "roles",
            title: "Роли",
            getPagePath: () => "/administration/rights",
            icon: "mdi-account-circle",
          },
          {
            id: "reports",
            title: "Отчеты",
            getPagePath: () => "/administration/reports",
            icon: "mdi-account-circle",
          },
        ],
      },
      getListMenuItem(),
      getBookingMenuItem(),
    ];

    sidebarItems.push(...res);
    allOpened.length = 0
    sidebarItems.forEach((item) => {
        allOpened.push(title)
      if (item.childs && item.childs.length > 0) {
        allChilds.push(...item.childs);
      }
    });
  };

  const clearChildsInFilteredChaptersGr = () => {
    opened.value.length = 0
  };

  const onNavigationEnter = () => {
    setPrevSidebar(isSidebarVisible.value);

    closeSidebar();
  };

  const onNavigationLeave = () => {
    setSidebar(isPrevSidebarVisible.value);
  };

  const onSearchClick = () => {
    closeSidebar();
    pInput.value.focus();
  };
  const clearSearchInput = () => {
    input.value = "";
  };

  const openPage = (path: string) => {
    setSidebar(isPrevSidebarVisible.value);
    toPage(path);
  };

  watch(isSidebarVisible, (newValue) => {
    if (newValue) {
      clearChildsInFilteredChaptersGr();
    }
  });

  const filteredItems = computed(() => {
    return sidebarItems.filter(item => {
      return item.title.toLowerCase().includes(input.value.toLowerCase()) ||
        (item.childs && item.childs.some(child => child.title.toLowerCase().includes(input.value.toLowerCase())));
    });
  });

  return {
    input,
    pInput,
    selected,
    opened,
    isSidebarVisible,
    drawer,
    drawerWidth,
    filteredItems,
    openPage,
    clearSearchInput,
    onSearchClick,
    onNavigationLeave,
    onNavigationEnter,
    getFilteredChapters,
    closeSidebar,
  };
};
