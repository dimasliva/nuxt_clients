import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "../../MoApiClient";
import type { RecordsStore } from "../RecordsStore";
import { DataEntity } from "./DataEntity";
import { injectable, inject } from "inversify";

  
@injectable()
export default class ScheduleTimeSpanEntity extends DataEntity {
    time: number = 0;
    duration: number = 0;
    type: number = 0;

    constructor(@inject("RecordsStore") __RecordStore: RecordsStore) {
        super(__RecordStore);
    }

    getTime() {
        return this.time
    }

    setTime(val: number) {
        this.time = val;
    }

    getDuration() {
        return this.duration
    }

    setDuration(val: number) {
        this.duration = val;
    }

    getType() {
        return this.type
    }

    setType(val: number) {
        this.type = val;
    }
}