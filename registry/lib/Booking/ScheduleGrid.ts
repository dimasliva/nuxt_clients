import * as Utils from '~/lib/Utils';
import { MoApiClient } from "../MoApi/MoApiClient";
import { injectable, inject } from 'inversify';
import type { RecordsStore } from '../MoApi/Records/RecordsStore';
import TimeSpanEntity from '../MoApi/Records/DataEntities/TimeSpanEntity';
import ScheduleTimeSpanEntity from '../MoApi/Records/DataEntities/ScheduleTimeSpanEntity';
import { BookingsViews, type IBookingListView } from '../MoApi/Views/BookingViews';
import type ScheduleTimespanItem from '../MoApi/Records/DataEntities/ScheduleTimespanItem';
import { BookingQuery, QuerySchedule } from '../MoApi/RequestArgs';
import type { TDatedScheduleTimespanItems } from '../MoApi/ApiSectionsV1/SchedulerApiSection';
import { v1 } from 'uuid';



@injectable()
export class ScheduleGrid {

    protected _grid: { [date: string]: ScheduleGridItem[] } = {};
    protected _bookings: IBookingListView[] = [];
    protected _schedule: TDatedScheduleTimespanItems = {};


    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
        @inject(BookingsViews) protected _BookingsViews: BookingsViews,
    ) { }



    async init(options: ScheduleGridOptions) {

        debugger;
        this._schedule = await this._MoApiClient.getScheduleApiSection().getSchedule(options);

        const bq: BookingQuery = new BookingQuery(options.begDate, options.endDate);
        bq.positionIds = options.positionIds;
        bq.placementIds = options.placementIds;
        bq.divisionIds = options.divisionIds;
        bq.statuses = options.bookingStatuses;
        bq.includeNames = true;
        bq.includePlace = true;
        bq.includeStatus = true;
        this._bookings = (await this._BookingsViews.getBookings(bq)).toArray();

        let currDate = new Date(options.begDate);
        currDate.setHours(0, 0, 0, 0);

        let endDate = new Date(options.endDate);
        endDate.setHours(0, 0, 0, 0);
        debugger;
        while (Utils.compareDates(currDate, endDate) <= 0) {

            //фильтруем данные на текущую дату
            const dateStr = Utils.getDateStr(currDate);
            const schedule = this._schedule[dateStr];
            const booking = this._bookings.filter(val => {
                const date = new Date(val.begDate!);
                date.setHours(0, 0, 0, 0);
                return Utils.compareDates(currDate, date) == 0;
            });


            const sgInfo = schedule.map<ScheduleGridInfo>(v => ScheduleGridInfo.fromScheduleTimespanItemFactory(v, this._RecordsStore));
            const bInfo = booking.map(v => BookingGridInfo.fromBookingListViewFactory(v, this._RecordsStore));
            this._grid[dateStr] = this._createScheduleGrid(sgInfo, bInfo, options.resolution);

            currDate = Utils.addDaysToDate(currDate, 1);
        }
        return this;
    }



    getGrid() {
        return this._grid;
    }



    protected _createScheduleGrid(sgInfo: ScheduleGridInfo[], bInfo: BookingGridInfo[], resolution: number = 5) {
        const minuteInDay = 1440;
        const gridSize = ~~(minuteInDay / resolution);
        const grid = Array.from(Array(gridSize), () => new ScheduleGridItem());

        //заполнение расписания
        sgInfo.forEach((val) => {
            const begItem = ~~(val.timespan.getTime() / resolution);
            const dur = val.timespan.getDuration();
            let endItem = (dur > 0) ? ~~((val.timespan.getTime() + dur - 1) / resolution) : begItem;
            if (endItem >= gridSize)
                endItem = gridSize - 1;
            for (let i = begItem; i <= endItem; i++)
                grid[i].schedule.push(val);
        });

        //заполнение предварительной записи
        bInfo.forEach((val) => {
            const begItem = ~~(val.timespan.getTime() / resolution);
            const dur = val.timespan.getDuration();
            let endItem = (dur > 0) ? ~~((val.timespan.getTime() + dur - 1) / resolution) : begItem;
            if (endItem >= gridSize)
                endItem = gridSize - 1;
            for (let i = begItem; i <= endItem; i++)
                grid[i].bookings.push(val);
        });

        return grid;
    }


    /**Проверка наложения пз */
    protected _checkOverlayBooking(b1: IBookingListView, b2: IBookingListView, checkTime = true) {
        debugger;
        if (checkTime) {
            const b1b = new Date(b1.begDate!).getTime();
            const b1e = b1b + (b1.duration || 0);
            const b2b = new Date(b2.begDate!).getTime();
            const b2e = b2b + (b2.duration || 0);

            if (b1b < b2e && b1e > b2b)
                return true;
        }

        if (b1.position != null && b2.position != null && b1.position == b2.position)
            return true;
        if (b1.division != null && b2.division != null && b1.division == b2.division)
            return true;
        if (b1.placement != null && b2.placement != null && b1.placement == b2.placement)
            return true;

        return false;
    }


    /**Проверка подходимости пз к расписанию*/
    protected _checkSchBookingMatch(sch: ScheduleTimespanItem, bk: IBookingListView, checkTime = true, productIds: string[] | null = null) {

        let res = true;
        debugger;
        if ((sch.position || bk.position) && sch.position != bk.position)
            return false;

        if ((sch.division || bk.division) && sch.division != bk.division)
            return false;

        if ((sch.placement || bk.placement) && sch.placement != bk.placement)
            return false;

        if (checkTime) {
            const schb = sch.getTimespan()!.getTime();
            const sche = schb + sch.getTimespan()!.duration;

            const bkb = this._getMinutesFromBeginDay(new Date(bk.begDate!))
            const bke = bkb + (bk.duration || 0);

            if (bkb < schb || bke > sche)
                return false;
        }

        //проверка, что все требуемые продукты имеются в элементе расписания
        const schProducts = sch.getProducts();
        if (schProducts && schProducts.length > 0 && productIds)
            if (!productIds.every(v => schProducts.includes(v)))
                return false;

        return true;
    }



    protected _getMinutesFromBeginDay(date: Date): number {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return hours * 60 + minutes;
    }


}



export class ScheduleGridOptions extends QuerySchedule {
    bookingStatuses: number[] | null = null;
    resolution: number = 5;
}



export class BookingGridInfo {
    timespan: TimeSpanEntity = null!;
    source: any;


    static fromBookingListViewFactory(item: IBookingListView, _RecordsStore: RecordsStore) {
        const res = new BookingGridInfo()
        res.timespan = new TimeSpanEntity(_RecordsStore);

        const begMinutes = Utils.getMinutesOfDay(new Date(item.begDate!));
        res.timespan.setTime(begMinutes);
        res.timespan.setDuration(item.duration!);
        res.source = item;
        return res;
    }
}



export class ScheduleGridInfo {
    timespan: ScheduleTimeSpanEntity = null!;
    source: any;


    static fromScheduleTimespanItemFactory(item: ScheduleTimespanItem, _RecordsStore: RecordsStore) {
        const res = new ScheduleGridInfo()
        res.timespan = item.getTimespan()!;
        res.source = item;
        return res;
    }
}



export class ScheduleGridItem {
    schedule: ScheduleGridInfo[] = []
    bookings: BookingGridInfo[] = []
}


export type TGridQuerySch = {
    begDate: Date;
    endDate: Date;
    begTime: number;
    endTime: number;
    positionId?: string | null;
    divisionId?: string | null;
    placementId?: string | null;
    productIds?: string[] | null;
}
