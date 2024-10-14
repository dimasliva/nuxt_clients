import { injectable, inject, Container } from "inversify";
import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";
import { Exception } from "~/lib/Exceptions";
import { FinderDataProvider, type TDictViewVal } from "./FinderDataProvider";
import type { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import type { ApiRecord } from "~/lib/MoApi/Records/ApiRecord";
import * as Utils from '~/lib/Utils';
import { EmployeesViews } from "~/lib/MoApi/Views/EmployeesViews";
import { EmployeeRecord } from "~/lib/MoApi/Records/EmployeeRecord";
import { EFinderFormHistoryResultTypeStorage } from "~/componentTemplates/forms/finderFormTemplate";
import FinderForm from '~/components/forms/FinderForm.vue';
import FinderFormMultiple from '~/components/forms/FinderFormMultiple.vue';
import { EmployeeListTemplate } from "~/componentTemplates/listTemplates/employeeListTemplate";
import { SelectFormTemplate } from "~/componentTemplates/forms/selectFormTemplate";


type fiotype = { name?: string, surname?: string, patronymic?: string } | null;

@injectable()
export class EmployeeFioFinderDataProvider extends FinderDataProvider {

    protected _listSizeLimit = 20;


    constructor(
        @inject("MoApiClient") _MoApiClient: MoApiClient,
        @inject("UserContext") _UserContext: UserContext,
        @inject("diC") protected _diC: Container,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
        @inject(EmployeesViews) protected _EmployeesViews: EmployeesViews
    ) {
        super(_MoApiClient, _UserContext);
        this._historyResultTypeStorage = EFinderFormHistoryResultTypeStorage.full;
        this._apiRequestTimeout = 2500;
    }



    override init(instName: string | null, multiselect = false, sizeLimit: number = 20) {
        super.init(instName, multiselect ? FinderFormMultiple : FinderForm);
        this._instName = instName;
        this._listSizeLimit = sizeLimit;

        const employeeTemplate = new EmployeeListTemplate(
            this._diC,
            {
                selectStrategy: multiselect ? "page" : "single",
                selectMode: true
            });
        const selTemplate = new SelectFormTemplate(this._diC, { title: "Выбор сотрудника", componentTemplate: employeeTemplate });

        const selComponent = defineComponent({
            setup: (p, c) => selTemplate.setup(p, c),
            render: selTemplate.render(),
        })

        this._selectFormComponent = selComponent;
    }



    async getList(text: string, ...args: any[]): Promise<TDictViewVal[]> {
        let whereArr: string[] = [];
        let fioStr = Utils.normalizeFio(text);

        if (fioStr) {
            let recdata = Utils.recognizeDataInString(fioStr);
            let fioArr = recdata.words;
            fioArr[fioArr.length - 1] += '%';
            whereArr.push(`surname like '${fioArr[0]}'`);
            if (fioArr[1]) whereArr.push(`name like '${fioArr[1]}'`);
            if (fioArr[2]) whereArr.push(`patronymic like '${fioArr[2]}'`);
            //if (recdata.date)
            //    whereArr.push(`birthdate= '${recdata.date.toISOString()}'`);
            let rdl = await this._EmployeesViews.getEmployeeListView({ select: "id,name,surname,patronymic", where: whereArr.join(" and "), limit: this._listSizeLimit })
            let res = rdl.toArray().map((item) => { return { value: item.id, title: Utils.makeFioStr(item.surname, item.name, item.patronymic) } });
            return res.sort((a, b) => a.title.localeCompare(b.title));
        }

        return [];
    }



    async getTitle(value: any, ...args: any[]): Promise<string | undefined> {
        if (!value)
            return undefined;
        const rec = await this._RecordsStore.fetch(EmployeeRecord, value);
        return Utils.makeFioStr(rec.Data!.surname, rec.Data!.name, rec.Data!.patronymic)
    }
}

