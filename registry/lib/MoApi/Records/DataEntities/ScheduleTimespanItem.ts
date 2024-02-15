import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "../../MoApiClient";
import type { RecordsStore } from "../RecordsStore";
import { DataEntity } from "./DataEntity";
import { injectable, inject } from "inversify";
import ScheduleTimeSpanEntity from "./ScheduleTimeSpanEntity";




@injectable()
export default class ScheduleTimespanItem extends DataEntity {
    timespan: ScheduleTimeSpanEntity = null!;
    position?: string;
    division?: string;
    placement?: string;
    products?: string[] | null;

    constructor(@inject("RecordsStore") __RecordStore: RecordsStore) {
        super(__RecordStore);
    }



    override fromJsonObj(obj: any) {
        super.fromJsonObj(obj)
        this.timespan = obj.mainAddress ? this.__RecordStore.dataEntityFactory(ScheduleTimeSpanEntity, obj.timespan) : null;
    }



    getTimespan() {
        return this.timespan
    }



    getDivision() {
        return this.division;
    }



    getPlacement() {
        return this.placement;
    }



    getProducts() {
        return this.products;
    }
}