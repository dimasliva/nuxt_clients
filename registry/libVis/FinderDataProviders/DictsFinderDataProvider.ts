import { injectable, inject, Container } from "inversify";
import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";
import { Exception } from "~/lib/Exceptions";
import { FinderDataProvider, type TDictViewVal } from "./FinderDataProvider";
import { QueryDictsFFParams } from "~/lib/MoApi/RequestArgs";
import { EDictionaries } from "~/lib/Dicts/DictionaryStore";
import type { Dictionary } from "~/lib/Dicts/Dictionary";
import * as Utils from '~/lib/Utils';
import { EFinderFormHistoryResultTypeStorage } from "~/componentTemplates/forms/finderFormTemplate";
import FinderForm from '~/components/forms/FinderForm.vue';
import FinderFormMultiple from '~/components/forms/FinderFormMultiple.vue';
import { PositionList } from "~/componentTemplates/listTemplates/positionListTemplate";
import { SelectFormTemplate } from "~/componentTemplates/forms/selectFormTemplate";


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
        super.init(instName, multiselect ? FinderFormMultiple : FinderForm);
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