import { injectable, inject, Container } from "inversify";
import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";
import { Exception } from "~/lib/Exceptions";
import { EFinderFormHistoryResultTypeStorage } from "~/componentTemplates/forms/finderFormTemplate";
import type { SelectFormTemplate } from "~/componentTemplates/forms/selectFormTemplate";
import { v1 } from "uuid";
import * as Utils from '~/lib/Utils';

export type TDictViewVal = { value: any, title: string }


@injectable()
export abstract class FinderDataProvider {

    protected _instName: string | null = null;
    protected _editFormComponent: any = null!; // component of FinderFormTemplate
    protected _historyResultTypeStorage = EFinderFormHistoryResultTypeStorage.none;
    protected _apiRequestTimeout = 1000;
    protected _selectFormComponent: any | null = null; // component of SelectFormTemplate | null=null;

    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("UserContext") protected _UserContext: UserContext,
        // @inject("diC") protected _diC: Container
    ) { }


    abstract getList(text: string, ...args): Promise<TDictViewVal[]>;
    abstract getTitle(value: any, ...args): Promise<string | undefined>;



    init(instName: string | null, editFormComponent: any, ...args) {
        this._instName = instName;
        this._editFormComponent = editFormComponent;
    }



    getInstName() { return this._instName; }



    async edit(choosedValues?: any): Promise<any | null> {
        return new Promise(resolve => {
            let ref: any = null;

            openDialog(this._editFormComponent,
                {
                    //diC: this._diC,
                    title: 'Поиск',
                    finderDataProvider: this,
                    apiRequestTimeout: this._apiRequestTimeout,
                    choosedValues: choosedValues,
                    historyResultTypeStorage: this._historyResultTypeStorage,
                    selectFormComponent: this._selectFormComponent
                },
                true,
                true,
                (e, d) => {
                    if (e == "onBeforeClose") resolve(d);
                    return true;
                });
        })
    }


    
    async getTitles(values: any[], ...args): Promise<(string | undefined)[]> {
        return await Utils.mapAsync(values, (v) => this.getTitle(v));
    }
}