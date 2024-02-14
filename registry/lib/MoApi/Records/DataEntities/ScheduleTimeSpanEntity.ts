import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "../../MoApiClient";
import type { RecordsStore } from "../RecordsStore";
import { DataEntity } from "./DataEntity";


export default class ScheduleTimeSpanEntity extends DataEntity {
    time: number = 0;
    duration: number = 0;
    type: number = 0;

    constructor(protected __MoApiClient: MoApiClient, __UserContext: UserContext, __RecordStore: RecordsStore) {
        super(__MoApiClient, __UserContext, __RecordStore);
        Object.defineProperty(this, "__MoApiClient", { enumerable: false });
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