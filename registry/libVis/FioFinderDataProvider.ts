import { injectable, inject } from "inversify";
import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "~/lib/MoApi/MoApiClient";
import { Exception } from "~/lib/Exceptions";
import { FinderDataProvider, type TDictViewVal } from "./FinderDataProvider";
import type { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import type { ApiRecord } from "~/lib/MoApi/Records/ApiRecord";
import * as Utils from '~/lib/Utils';


type fiotype= { name?: string, surname?: string, patronymic?: string } | null;

@injectable()
export class FioFinderDataProvider extends FinderDataProvider {

    protected _recordType: Class<ApiRecord> = null!;
    protected _listSizeLimit = 20;
    protected _fioFields?: fiotype = null;


    constructor(@inject("MoApiClient") _MoApiClient: MoApiClient, @inject("UserContext") _UserContext: UserContext, @inject("UserContext") _RecordsStore: RecordsStore) {
        super(_MoApiClient, _UserContext);
    }



    init(instName: string | null, editFormComponent: any, recordType: Class<ApiRecord>, fioFields: fiotype, sizeLimit: number = 20) {
        super.init(instName, editFormComponent);
        this._instName = instName;
        this._listSizeLimit = sizeLimit;
        this._recordType = recordType;
        this._fioFields=fioFields;
    }



    async getList(text: string, ...args: any[]): Promise<TDictViewVal[]> {
        let whereArr: string[] = [];
        let fioStr = Utils.normalizeFio(text);
        let phone = '';
        let email = '';
    
        if (fioStr) {
          let recdata = Utils.recognizeDataInString(fioStr);
    
          let fioArr = recdata.words;
          fioArr[fioArr.length - 1] += '%';
          whereArr.push(`surname like '${fioArr[0]}'`);
          if (fioArr[1]) whereArr.push(`name like '${fioArr[1]}'`);
          if (fioArr[2]) whereArr.push(`patronymic like '${fioArr[2]}'`);
    
          if (recdata.date)
            whereArr.push(`birthdate= '${recdata.date.toISOString()}'`);

        return res.data.map((item) => { return { value: item[0], title: item[1] } });
    }



    async getTitle(value: any, ...args: any[]): Promise<string | undefined> {
        return await this._dict.tryGetValByCode(value);
    }


    async  getTitles(values: any[], ...args: any[]): Promise<string[] | undefined> {
        return await Utils.mapAsync(values, (val)=>this._dict.tryGetValByCode(val));
    }


}