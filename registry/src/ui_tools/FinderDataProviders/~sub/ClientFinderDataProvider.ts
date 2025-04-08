import { injectable, inject, Container } from "inversify";
import type { UserContext } from "~/src/common/lib/UserContext";
import type { MoApiClient } from "~/src/common/lib/MoApi/MoApiClient";
import { Exception } from "~/src/common/lib/Exceptions";
import { FinderDataProvider, type TDictViewVal } from "../FinderDataProvider";
import type { RecordsStore } from "~/src/common/lib/MoApi/Records/RecordsStore";
import * as Utils from '~/src/common/lib/Utils';
import { ClientRecord } from "~/src/common/lib/MoApi/Records/ClientRecord";
import { EFinderFormHistoryResultTypeStorage } from "~forms/WindowDialogs/~sub/FinderForms/FinderFormTemplate";
import FinderForm from '~forms/WindowDialogs/~sub/FinderForms/FinderForm.vue';
import FinderFormMultiple from '~forms/WindowDialogs/~sub/FinderForms/~sub/FinderFormMultiple/FinderFormMultiple.vue';
import { SelectFormTemplate } from "~forms/WindowDialogs/~sub/SelectForms/SelectFormTemplate";
import { ClientList } from "~/src/widgets/Lists/~sub/ClientListTemplate";


type fiotype = { name?: string, surname?: string, patronymic?: string } | null;

@injectable()
export class ClientFinderDataProvider extends FinderDataProvider {

    protected _listSizeLimit = 20;


    constructor(
        @inject("MoApiClient") _MoApiClient: MoApiClient,
        @inject("UserContext") _UserContext: UserContext,
        @inject("diC") protected _diC: Container,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
    ) {
        super(_MoApiClient, _UserContext);
        this._historyResultTypeStorage = EFinderFormHistoryResultTypeStorage.full;
        this._apiRequestTimeout = 2500;
    }



    override init(instName: string | null, multiselect = false, sizeLimit: number = 20) {
        super.init(instName, null, null);
        this._instName = instName;
        this._listSizeLimit = sizeLimit;

        const clientTemplate = new ClientList(
            this._diC,
            {
                selectStrategy: multiselect ? "page" : "single",
                selectMode: true
            });
        const selTemplate = new SelectFormTemplate(this._diC, { title: "Выбор клиента", componentTemplate: clientTemplate });

        const selComponent = defineComponent({
            setup: (p, c) => selTemplate.setup(p, c),
            render: selTemplate.render(),
        })

        this._selectFormComponent = selComponent;
    }



    async getList(txt: string): Promise<TDictViewVal[]> {
        return [];
    }



    async getTitle(value: any, ...args: any[]): Promise<string | undefined> {
        if (!value)
            return undefined;
        const rec = await this._RecordsStore.fetch(ClientRecord, value);
        return Utils.makeFioStr(rec.Data!.surname, rec.Data!.name, rec.Data!.patronymic)
    }
}

