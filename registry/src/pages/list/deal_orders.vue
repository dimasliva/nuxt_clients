<script lang="ts">
import { useI18n } from "vue-i18n"
import { DealOrderListTemplate } from "~/src/widgets/Lists/~sub/DealOrderListTemplate";
import { EmployeeAppProfilePageDataStorageCell } from "~/src/common/lib/EmployeeAppProfile";

import type { IFrameHeaderData, PageMap } from "~/src/common/lib/PageMap";

let t: any;
const PAGE_PATH = "/list/deal_orders";


export default {

  async setup(props, ctx) {

    t = useI18n().t;
    let diC = useSessionContainer();
    const settingStorage = diC.get(EmployeeAppProfilePageDataStorageCell);
    settingStorage.initPageSec(PAGE_PATH)
    const o = new DealOrderListTemplate(diC, { settingsStorage: settingStorage });
     o.setup(props,ctx);
    diC.get<PageMap>("PageMap").setPageData(PAGE_PATH, o.getFrameHeaderData());

    const del = () => { }

    return o.render();
  }

}


</script>