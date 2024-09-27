<script lang="ts">

import { QueryParams } from '~/lib/MoApi/RequestArgs';
import EmployeeProfileDialog from '~/components/forms/EmplProfileDialog.vue';
import * as Utils from '~/lib/Utils';
import * as vHelpers from '~/libVis/Helpers';
import { useI18n } from "vue-i18n"
import type { IDataTableDescription, IDataTableHeadersDescription } from '~/componentComposables/dataTables/useDataTable';
import { EmployeeRecord } from '~/lib/MoApi/Records/EmployeeRecord';
import { EmployeeContactsRecord } from '~/lib/MoApi/Records/EmployeeContactsRecord';
import { ListTemplate } from '~/componentTemplates/listTemplates/listTemplate';
import { EmployeesViews } from '~/lib/MoApi/Views/EmployeesViews';
import { recognizeDataInString } from '~/lib/Utils';
import { EDataType } from '~/lib/globalTypes';
import { EmployeeAppProfilePageDataStorageCell } from '~/lib/EmployeeAppProfile';
import { EmployeeList } from '~/componentTemplates/listTemplates/employeeListTemplate';
import type { PageMap } from '~/lib/PageMap';


let t: any;
//Указание пути текущей страницы
const PAGE_PATH = "/administration/employees";


export default {
  setup(props, ctx) {

    t = useI18n().t;

    let diC = useSessionContainer();
    const settingStorage = diC.get(EmployeeAppProfilePageDataStorageCell);
    settingStorage.initPageSec(PAGE_PATH);
    const o = new EmployeeList(diC, { settingsStorage: settingStorage });
    o.setup(ctx);
    diC.get<PageMap>("PageMap").setPageData(PAGE_PATH, o.getFrameHeaderData());
    
    const del = () => { }

    return o.render();
  }
}


</script>