import { injectable, inject, Container } from "inversify";
import type { UserContext } from "~/src/common/lib/UserContext";
import type { MoApiClient } from "~/src/common/lib/MoApi/MoApiClient";
import { EFinderFormHistoryResultTypeStorage } from "~forms/WindowDialogs/~sub/FinderForms/FinderFormTemplate";
import * as Utils from '~/src/common/lib/Utils';
import * as vHelpers from "~uilib/Helpers";
import { title } from "process";

export type TDictViewVal = { value: any, title: string }


@injectable()
export abstract class FinderDataProvider {

    protected _instName: string | null = null;
    protected _findFormComponent: any | null = null; // component of FinderFormTemplate
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



    init(instName: string | null, findFormComponent: any | null, selectFormComponent: any | null, ...args) {
        this._instName = instName;
        this._findFormComponent = findFormComponent;
        this._selectFormComponent = selectFormComponent
    }



    getInstName() { return this._instName; }



    async find(choosedValues?: any): Promise<any | null> {
        return new Promise(resolve => {
            if (!this._findFormComponent)
                resolve(null);

            openDialog(this._findFormComponent,
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



    async select(choosedValues?: any): Promise<any | null> {
        return new Promise(resolve => {
            if (!this._selectFormComponent)
                resolve(null);

            openDialog(
                this._selectFormComponent,
                {
                    width: "100%",
                    choosedValues: choosedValues
                },
                true,
                true,
                (e, d) => {
                    if (e == "onBeforeClose") {
                        if (d) {
                            vHelpers.action(async () => {
                                resolve(await this.getTitles(d));
                            });
                        }
                        else
                            resolve(d);
                    }
                    return true;
                }
            );
        })
    }


    isFindable() {
        return !!this._findFormComponent;
    }


    isSelectable() {
        return !!this._selectFormComponent;
    }


    async getTitles(values: any[], ...args): Promise<TDictViewVal[]> {
        return await Utils.mapAsync(values, async (v) => {
            return { value: v, title: await this.getTitle(v) }
        });
    }
}