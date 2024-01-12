import { injectable, inject } from "inversify";
import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";
import { Exception } from "~/lib/Exceptions";

export type TDictViewVal = { value: any, title: string }


@injectable()
export abstract class FinderDataProvider {

    protected _instName: string | null = null;
    protected _editFormComponent: any = null!;


    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) { }


    abstract getList(text: string, ...args): Promise<TDictViewVal[]>;
    abstract getTitle(value: any, ...args): Promise<string | undefined>;



    init(instName: string | null, editFormComponent: any, ...args) {
        this._instName = instName;
        this._editFormComponent = editFormComponent;
    }



    getInstName() { return this._instName; }



    async edit(): Promise<string | number | null> {

        return new Promise(resolve => {
            openDialog(this._editFormComponent, { title: 'Поиск', finderDataProvider: this }, true, (e, d) => {
                if (e == "onBeforeClose")
                    resolve(d);
                return true;
            });
        })
    }
}