<script lang="ts">
import { useI18n } from "vue-i18n"
import { DealListTemplate } from "~/componentTemplates/listTemplates/dealListTemplate";
import { EmployeeAppProfilePageDataStorageCell } from "~/lib/EmployeeAppProfile";

import type { IFrameHeaderData, PageMap } from "~/lib/PageMap";

let t: any;
const PAGE_PATH = "/list/deals";


export default {

  async setup(props, ctx) {

    t = useI18n().t;
    let diC = useSessionContainer();
    const settingStorage = diC.get(EmployeeAppProfilePageDataStorageCell);
    settingStorage.initPageSec(PAGE_PATH)
    const o = new DealListTemplate(diC, { settingsStorage: settingStorage });
     o.setup(props,ctx);
    diC.get<PageMap>("PageMap").setPageData(PAGE_PATH, o.getFrameHeaderData());

    const del = () => { }

    return o.render();
  }

}


</script>