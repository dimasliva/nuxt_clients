<script lang="ts">
import { useI18n } from "vue-i18n"
import { ScheduleItemGroupListTemplate } from "~/src/widgets/Lists/~sub/SchedulerItemGroupListTemplate";
import { EmployeeAppProfilePageDataStorageCell } from "~/src/common/lib/EmployeeAppProfile";

import type { PageMap } from "~/src/common/lib/PageMap";

let t: any;
const PAGE_PATH = "/list/schedule_item_group";


export default {

  async setup(props, ctx) {

    t = useI18n().t;
    let diC = useSessionContainer();
    const settingStorage = diC.get(EmployeeAppProfilePageDataStorageCell);
    settingStorage.initPageSec(PAGE_PATH)
    const o = new ScheduleItemGroupListTemplate(diC, { settingsStorage: settingStorage });
    o.setup(props, ctx);
    diC.get<PageMap>("PageMap").setPageData(PAGE_PATH, o.getFrameHeaderData());

    const del = () => { }

    return o.render();
  }

}


</script>