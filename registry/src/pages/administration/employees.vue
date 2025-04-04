<script lang="ts">

import { useI18n } from "vue-i18n"
import { EmployeeAppProfilePageDataStorageCell } from '~/src/common/lib/EmployeeAppProfile';
import { EmployeeListTemplate } from '~/src/widgets/Lists/~sub/EmployeeListTemplate';
import type { PageMap } from '~/src/common/lib/PageMap';


let t: any;
//Указание пути текущей страницы
const PAGE_PATH = "/administration/employees";


export default {
  setup(props, ctx) {

    t = useI18n().t;

    let diC = useSessionContainer();
    const settingStorage = diC.get(EmployeeAppProfilePageDataStorageCell);
    settingStorage.initPageSec(PAGE_PATH);
    const o = new EmployeeListTemplate(diC, { settingsStorage: settingStorage });
    o.setup(props,ctx);
    diC.get<PageMap>("PageMap").setPageData(PAGE_PATH, o.getFrameHeaderData());
    
    const del = () => { }

    return o.render();
  }
}


</script>