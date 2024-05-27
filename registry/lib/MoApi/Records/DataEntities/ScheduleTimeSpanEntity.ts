import type { UserContext } from "~/lib/UserContext";
import type { MoApiClient } from "../../MoApiClient";
import type { RecordsStore } from "../RecordsStore";
import { injectable, inject } from "inversify";
import TimeSpanEntity from "./TimeSpanEntity";


export const enum EEmployeeTimeTypes {
  WORK = 1,
  DINNER_BREAK = 2,
  SERVICE_BREAK = 3,
  BREAK = 4,
  MEETING = 5,
  EXERCISES = 6
}



@injectable()
export default class ScheduleTimeSpanEntity extends TimeSpanEntity {
  type: number = 0;

  constructor(@inject("RecordsStore") __RecordStore: RecordsStore) {
    super(__RecordStore);
  }



  getType() {
    return this.type;
  }



  setType(val: number) {
    this.type = val;
  }
}
