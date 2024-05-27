

import { injectable, inject, Container } from "inversify";
import { MoApiClient } from "./MoApiClient";
import { RecordsApiSection } from "./ApiSectionsV1/RecordsApiSection";
import { Exception } from "../Exceptions";
import type { TBookingParams } from "../Booking/ScheduleGrid";
import * as U from '~/lib/Utils';
import { ApiLock } from "./ApiLock";


export const BOOKING_PREF_LOCK = "booking_lock";


@injectable()
export class Locks {

    constructor(
        @inject(RecordsApiSection) protected _RecordsApiSection: RecordsApiSection,
        @inject("diC") protected _diC: Container
    ) { }


    async getBookingLock(date: Date, bk: TBookingParams) {

        let mainBlokPar = bk.position;
        if (!mainBlokPar)
            if (bk.placement)
                mainBlokPar = bk.placement;
            else
                mainBlokPar = bk.division;

        const rawStr = `${BOOKING_PREF_LOCK}_${U.getDateStr(date)}_${mainBlokPar}`;
        const hashId = await U.getHashHex(rawStr, "SHA-1");
        const res= this._diC.get(ApiLock);
        res.init(hashId);
        return res;
    }

}
