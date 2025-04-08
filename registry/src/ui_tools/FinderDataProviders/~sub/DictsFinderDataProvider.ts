import { injectable, inject, Container } from "inversify";
import type { UserContext } from "~/src/common/lib/UserContext";
import type { MoApiClient } from "~/src/common/lib/MoApi/MoApiClient";
import { Exception } from "~/src/common/lib/Exceptions";
import { FinderDataProvider, type TDictViewVal } from "../FinderDataProvider";
import { QueryDictsFFParams } from "~/src/common/lib/MoApi/RequestArgs";
import { EDictionaries } from "~/src/common/lib/Dicts/DictionaryStore";
import type { Dictionary } from "~/src/common/lib/Dicts/Dictionary";
import * as Utils from '~/src/common/lib/Utils';
import { EFinderFormHistoryResultTypeStorage } from "~forms/WindowDialogs/~sub/FinderForms/FinderFormTemplate";
import FinderForm from '~forms/WindowDialogs/~sub/FinderForms/FinderForm.vue';
import FinderFormMultiple from '~forms/WindowDialogs/~sub/FinderForms/~sub/FinderFormMultiple/FinderFormMultiple.vue';
import { PositionListTemplate } from "~/src/widgets/Lists/~sub/PositionListTemplate";
import { SelectFormTemplate } from "~forms/WindowDialogs/~sub/SelectForms/SelectFormTemplate";


@injectable()
export class DictsFinderDataProvider extends FinderDataProvider {

    protected _dictId: EDictionaries = null!;
    protected _dict: Dictionary = null!;
    protected _dictSection: number | undefined = undefined;
    protected _listSizeLimit = 20;

    constructor(
        @inject("MoApiClient") _MoApiClient: MoApiClient,
        @inject("UserContext") _UserContext: UserContext,
        @inject("diC") protected _diC: Container,
    ) {
        super(_MoApiClient, _UserContext);
    }


    override init(instName: string | null, multiselect = false, dictId: EDictionaries, dictSection: number | undefined = undefined, sizeLimit: number = 20) {
        super.init(instName, multiselect ? FinderFormMultiple : FinderForm, null);
        this._instName = instName;
        this._dictId = dictId;
        this._dictSection = dictSection;
        this._listSizeLimit = sizeLimit;
        this._dict = this._MoApiClient.getDictionaryStore().getDictionary(this._dictId);
        this._historyResultTypeStorage = EFinderFormHistoryResultTypeStorage.valOnly;
    }



    async getList(text: string, ...args: any[]): Promise<TDictViewVal[]> {
        let res = await this._dict.fsDictItemsListView(text);
        return res.data.map((item) => { return { value: item[0], title: item[1] } });
    }


    async getTitle(value: any, ...args: any[]): Promise<string | undefined> {
        return await this._dict.tryGetValByCode(value);
    }


}