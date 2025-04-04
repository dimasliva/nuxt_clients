<script lang="ts">

import { useI18n } from "vue-i18n"
import type { Container } from 'inversify';
import { ProductNavigatorTemplate, type IProductNavigatorTemplateProps } from "~/src/widgets/Navigators/~sub/ProductNavigatorTemplate";
import type { PageMap } from "~/src/common/lib/PageMap";
import { EmployeeAppProfilePageDataStorageCell } from "~/src/common/lib/EmployeeAppProfile";


let t: any;

const PAGE_PATH = "/list/product_catalogs";


export default {
  props: {
    diC: {
      type: Object as PropType<Container>,
      required: false
    }
  },



  async setup(props, ctx) {
    t = useI18n().t;

    const diC = props.diC || useSessionContainer();

    const settingStorage = diC.get(EmployeeAppProfilePageDataStorageCell);
    settingStorage.initPageSec(PAGE_PATH);
    const o = new ProductNavigatorTemplate(diC, null, { settingsStorage: settingStorage });
    await o.setup(props, ctx);
    diC.get<PageMap>("PageMap").setPageData(PAGE_PATH, { title: "Товары и услуги" });
    const del = () => { }
    return o.render();
  }
}


</script>