<template>
  <ProductNavigator ref="productNavigatorRef" :diC="diC" :settingsStorage="settingStorage" />
</template>


<script setup lang="ts">

import { useI18n } from "vue-i18n"
//import ProductNavigator from "~/src/widgets/Navigators/~sub/ProductNavigatorTemplate";
import type { PageMap } from "~/src/common/lib/PageMap";
import { EmployeeAppProfilePageDataStorageCell } from "~/src/common/lib/EmployeeAppProfile";

const PAGE_PATH = "/list/product_catalogs";

let t = useI18n().t;

const diC = useSessionContainer();
const settingStorage = diC.get(EmployeeAppProfilePageDataStorageCell);
const productNavigatorRef = ref();
settingStorage.initPageSec(PAGE_PATH);
diC.get<PageMap>("PageMap").setPageData(PAGE_PATH, { title: "Товары и услуги" });


defineExpose({
  eventsHandler: (e, d) => productNavigatorRef.value.eventsHandler(e, d),
});

</script>