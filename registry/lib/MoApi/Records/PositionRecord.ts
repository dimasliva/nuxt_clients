import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";



export class PositionRecordData extends ApiRecordChData {
    employee: string = null!;
    position: number = 0;
    profession: number = 0;
    specialty: number = 0;
    notActive?: boolean | null = null;
    advData?: any | null = null;
}


export class PositionRecord extends ApiRecord<PositionRecordData>{

    static RightToken = "dbPosition";
    static RecCode = 1017;


    constructor(protected _MoApiClient: MoApiClient, protected _UserContext: UserContext, _RecStore: RecordsStore, Key: string) {
        super(_MoApiClient, _UserContext, _RecStore, PositionRecord, Key);
    }

    get RecCode() { return PositionRecord.RecCode; }

 
    protected _createNewData() {
        return   this._RecStore.dataEntityFactory(PositionRecordData, this.Key);
    }


    protected _getApiRecordPathGet = () => "/Positions/GetPositions";


    protected _getApiRecordPathAdd = () => "/Positions/AddPosition";


    protected _getApiRecordPathUpdate = () => "/Positions/UpdatePosition";


    protected _getApiRecordPathDelete = () => "/Positions/DeletePosition";

}