<script lang="ts">

import { useI18n } from "vue-i18n"
import type { Container } from 'inversify';
import { ProductNavigatorTemplate, type IProductNavigatorTemplateProps } from "~/componentTemplates/navigatorTemplates/productNavigatorTemplate";
import type { PageMap } from "~/lib/PageMap";
import { EmployeeAppProfilePageDataStorageCell } from "~/lib/EmployeeAppProfile";


let t: any;

const PAGE_PATH = "/list/product_catalogs";


export default {
  props: {
    diC: {
      type: Object as PropType<Container>,
      required: false
    }
  },



  async setup(props: IProductNavigatorTemplateProps, ctx) {
    t = useI18n().t;

    const diC = props.diC || useSessionContainer();

    const settingStorage = diC.get(EmployeeAppProfilePageDataStorageCell);
    settingStorage.initPageSec(PAGE_PATH);
    const o = new ProductNavigatorTemplate(diC, null, { settingsStorage: settingStorage });
    await o.setup(ctx);
    diC.get<PageMap>("PageMap").setPageData(PAGE_PATH, { title: "Товары и услуги" });
    const del = () => { }
    return o.render();
  }
}


</script>