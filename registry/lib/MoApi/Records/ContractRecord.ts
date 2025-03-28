import { injectable, inject } from "inversify";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";
import { Exception } from "~/lib/Exceptions";


@injectable()
export class ContractRecordData extends ApiRecordChData {
    date: string= "";
    beginDate: string = "";
    endDate: string = "";
    number: string = "";
    companyOrganization: string = "";
    payerOrganization?: string | null = null;
    client?: string | null = null;
    payerClient?: string | null = null;
    priceType?: number | null = null;
    notActive?: boolean | null = null;
    advData?: any | null = null;
}



@injectable()

export class ContractRecord extends ApiRecord<ContractRecordData> {

    static override RightToken = "dbContract";
    static override RecCode = 1053;
    static override BatchGetRecDataPath = "/Finance/GetContracts";
    static override RecordsFindPath = "/Finance/FindContracts";


    constructor(
        @inject("MoApiClient") _MoApiClient: MoApiClient,
        @inject("UserContext") _UserContext: UserContext,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
    ) {
        super(_MoApiClient, _UserContext);
    }


    get RecCode() { return ContractRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(ContractRecordData, null, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Finance/GetContracts";


    protected _getApiRecordPathAdd = () => "/Finance/AddContract";


    protected _getApiRecordPathUpdate= () => "/Finance/UpdateContract";


    protected _getApiRecordPathDelete= () => "/Finance/DeleteContract";

}