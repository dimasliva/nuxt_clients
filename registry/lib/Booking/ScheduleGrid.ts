import * as U from '~/lib/Utils';
import { MoApiClient } from "../MoApi/MoApiClient";
import { injectable, inject } from 'inversify';
import type { RecordsStore } from '../MoApi/Records/RecordsStore';
import TimeSpanEntity from '../MoApi/Records/DataEntities/TimeSpanEntity';
import ScheduleTimeSpanEntity, { EEmployeeTimeTypes } from '../MoApi/Records/DataEntities/ScheduleTimeSpanEntity';
import { BookingsViews, type IBookingListView } from '../MoApi/Views/BookingViews';
import type ScheduleTimespanItem from '../MoApi/Records/DataEntities/ScheduleTimespanItem';
import { BookingQuery, QuerySchedule } from '../MoApi/RequestArgs';
import type { TDatedScheduleTimespanItems } from '../MoApi/ApiSectionsV1/SchedulerApiSection';
import { Exception } from '../Exceptions';
import { Locks } from '../MoApi/Locks';
import type { BookingRecord } from '../MoApi/Records/BookingRecord';


@injectable()
export class ScheduleGrid {

    protected _grid: { [date: string]: ScheduleGridItem[] } = {};
    protected _resolution: number = 5;
    protected _options: ScheduleGridOptions = null!

    constructor(
        @inject("MoApiClient") protected _MoApiClient: MoApiClient,
        @inject("RecordsStore") protected _RecordsStore: RecordsStore,
        @inject(BookingsViews) protected _BookingsViews: BookingsViews,
        @inject(Locks) protected _Locks: Locks,
    ) { }



    async init(options: ScheduleGridOptions) {
        this._options = options;
        const schedule = await this._MoApiClient.getScheduleApiSection().getSchedule(options);

        const bq: BookingQuery = new BookingQuery(options.begDate, options.endDate);
        bq.positionIds = options.positionIds;
        bq.placementIds = options.placementIds;
        bq.divisionIds = options.divisionIds;
        bq.statuses = options.bookingStatuses;
        bq.includeNames = false;
        bq.includePlace = true;
        bq.includeStatus = (bq.statuses?.length == 1) ? false : true;
        const bookings = (await this._BookingsViews.getBookings(bq)).toArray();

        let begDate = new Date(options.begDate);
        begDate.setHours(0, 0, 0, 0);

        let currDate = begDate;

        let endDate = new Date(options.endDate);
        endDate.setHours(0, 0, 0, 0);

        while (U.compareDates(currDate, endDate) <= 0) {

            //фильтруем данные на текущую дату
            const dateStr = U.getDateStr(currDate);
            const oneDaySchedule = schedule[dateStr];
            const oneDayBooking = bookings.filter(val => {
                const date = new Date(val.begDate!);
                date.setHours(0, 0, 0, 0);
                return U.compareDates(currDate, date) == 0;
            });

            const sgInfo = oneDaySchedule.map<ScheduleGridInfo>(v => ScheduleGridInfo.fromScheduleTimespanItemFactory(v, this._RecordsStore));
            const bInfo = oneDayBooking.map(v => BookingGridInfo.fromBookingListViewFactory(v, this._RecordsStore));
            this._grid[dateStr] = this._createScheduleGrid(sgInfo, bInfo, options.resolution);

            currDate = U.addDaysToDate(currDate, 1);
        }

        this._resolution = options.resolution;
        return this;
    }


    /**Загрузка сетки на определенную дату */
    protected async _loadOneDay(date: Date) {
        const dateStr = U.getDateStr(date);

        const options = U.CloneData(this._options);
        options.begDate = dateStr;
        options.endDate = dateStr;

        const oneDaySchedule = (await this._MoApiClient.getScheduleApiSection().getSchedule(options))[dateStr];

        const bq: BookingQuery = new BookingQuery(dateStr, dateStr);
        bq.positionIds = options.positionIds;
        bq.placementIds = options.placementIds;
        bq.divisionIds = options.divisionIds;
        bq.statuses = options.bookingStatuses;
        bq.includeNames = true;
        bq.includePlace = true;
        bq.includeStatus = true;
        const oneDayBooking = (await this._BookingsViews.getBookings(bq)).toArray();

        const sgInfo = oneDaySchedule.map<ScheduleGridInfo>(v => ScheduleGridInfo.fromScheduleTimespanItemFactory(v, this._RecordsStore));
        const bInfo = oneDayBooking.map(v => BookingGridInfo.fromBookingListViewFactory(v, this._RecordsStore));
        this._grid[dateStr] = this._createScheduleGrid(sgInfo, bInfo, options.resolution);

        return this._grid[dateStr];
    }



    /**Поиск первого подходящего свободного времении в расписании для брони с указанными параметрами*/
    getEmptyTimeForBooking(params: TGridQuerySch) {

        //проверка диапазона - загружены ли данные в указанном диапазоне
        this._chkReqPeriod(params.begDate, params.endDate);


        let currDate = params.begDate;

        const bk = params.booking;

        while (U.compareDatesOnly(currDate, params.endDate) <= 0) {

            let gridPerDay = this._grid[U.getDateStr(currDate)];
            let timeCnt = 0;
            let begTime = 0;
            let minDuration = bk.duration;

            const normBegTime = ~~(params.begTime / this._resolution);
            const normEndTime = ~~(params.endTime / this._resolution);

            for (let i = normBegTime; i <= normEndTime && i < gridPerDay.length; i++) {

                const sgItem = gridPerDay[i];
                const schedule = sgItem.schedule;
                const bookings = sgItem.bookings;
                let matchable = false;

                //не проверено
                //если есть хотя бы один подходящий элемент расписания на текущее время, то бронирование подходит к ячейке
                for (let schi = 0; schi < schedule.length; schi++)
                    if (this._checkSchBookingMatch(schedule[schi].source, bk)) {
                        matchable = true;
                        //если длительность не задана в params, то берется минимальная из первых подходящих элементов расписания
                        if (!bk.duration && timeCnt == 0) {
                            const defDur = schedule[schi].source.defDuration || 1;
                            minDuration = minDuration ? Math.min(minDuration, defDur) : defDur;
                        }
                        else
                            break;
                    }

                //если бронь походит к расписанию, проверяем наложение с уже существующими бронями
                if (matchable && !bookings.every(v => this._checkOverlayBooking(v.source, bk, minDuration)))
                    matchable = false;

                if (matchable) {
                    if (++timeCnt == 1)
                        begTime = i * this._resolution;

                    //если timeCnt достиг требуемой длительности, значит подходящее время найдено
                    if (timeCnt >= Math.ceil(minDuration / this._resolution)) {
                        const resDate = new Date(currDate);
                        resDate.setHours(Math.trunc(begTime / 60));
                        resDate.setMinutes(begTime % 60);
                        resDate.setSeconds(0);
                        return { date: resDate, duration: minDuration };
                    }
                }
                else
                    timeCnt = 0;
            }
            currDate = U.addDaysToDate(currDate, 1);
        }

        return null;
    }


    //не проверено
    /**Возвращает минимальную длительность из подходящих к брони элементов расписания. Возвращает -1 если ни одного подходящего элемента не было найдено */
    getMinSchedulerDuration(sch: ScheduleGridInfo[], bk: TBookingParams) {
        let minDuration = -1;
        //если есть хотя бы один подходящий элемент расписания на текущее время, то бронирование подходит к ячейке
        for (let schi = 0; schi < sch.length; schi++)
            if (this._checkSchBookingMatch(sch[schi].source, bk))
                minDuration = (minDuration > 0) ? Math.min(minDuration, schi[schi].source.defDuration) : schi[schi].source.defDuration || 1;
        return minDuration;
    }



    protected async _chkReqPeriod(begDate, endDate) {

        let currDate = begDate;

        while (U.compareDates(currDate, endDate) <= 0) {

            const currDateStr = U.getDateStr(currDate);

            if (!this._grid[currDateStr])
                await this._loadOneDay(currDate);

            currDate = U.addDaysToDate(currDate, 1);
        }
    }


    /**Проверка брони на подходимость к расписанию и отсутствию наложений на указонное время.
     * При forceUpdate==true будет производится получение блокировки и обновление данных.
     * Если задана func, то если бронь подходит проверку, будет вызвана func при действующей блокировке(если forceUpdate==true)
     */
    async checkEmptySch(date: Date, bk: TBookingParams, func?: (number) => Promise<any>, forceUpdate = false) {

        const lock = await this._Locks.getBookingLock(date, bk);

        try {
            if (forceUpdate) {
                await lock.waitLock(15 * 1000);
                if (!lock.isСaptured())
                    throw new Exception("ERR", "Не удалось получть эксклюзивый доступ")
                await this._loadOneDay(date);
            }
            else
                await this._chkReqPeriod(date, date);

            const grDate = U.getDateStr(date);
            const grTime = this._getMinutesFromBeginDay(date);
            const normTime = ~~(grTime / this._resolution);
            let minDuration = bk.duration;
            let gridPerDay = this._grid[grDate];

            let currTime = normTime;

            while (currTime < gridPerDay.length) {

                const sgItem = gridPerDay[currTime];
                const schedule = sgItem.schedule;
                const bookings = sgItem.bookings;
                let matchable = false;

                for (let schi = 0; schi < schedule.length; schi++)
                    if (this._checkSchBookingMatch(schedule[schi].source, bk)) {
                        matchable = true;
                        //если длительность не задана в params, то берется минимальная из первых подходящих элементов расписания
                        if (!bk.duration && currTime == normTime) {
                            const defDur = schedule[schi].source.defDuration || 1;
                            minDuration = minDuration ? Math.min(minDuration, defDur) : defDur;
                        }
                        else
                            break;
                    }

                if (!matchable || !bookings.every(v => this._checkOverlayBooking(v.source, bk, minDuration)))
                    return false;

                if (++currTime >= normTime + Math.ceil(minDuration / this._resolution)) {
                    if (func)
                        await func(minDuration);
                    return true;
                }
            }
            return false;
        }
        finally {
            await lock.unlock();
        }
    }



    updateBookingInfo(bk: IBookingListView) {
        const bdata = new Date(bk.begDate!);
        const grDate = U.getDateStr(bdata);
        const grTime = this._getMinutesFromBeginDay(bdata);
        const normTime = ~~(grTime / this._resolution);
        const normDuration = Math.ceil(bk.duration! / this._resolution);
        const gridDay = this._grid[grDate];

        //заносим данные брони в текущий grid
        for (let i = normTime; i < normTime + normDuration; i++) {
            const curbgi = gridDay[i].bookings.find(v => v.source.id == bk.id);
            if (curbgi)
                curbgi.source = bk;
            else
                console.error(`Не найдена запись брони, которая обязана быть. Данные расписания и броней могут быть некорректными`);
        }
    }


    async addBooking(bookingRec: BookingRecord, products: string[], forceUpdate = true) {
        const bdata = bookingRec.MData;

        const bookingDate = new Date(bdata.beginDate);

        const bk: TBookingParams = {
            begTime: this._getMinutesFromBeginDay(bookingDate),
            duration: bdata.duration,
            position: bdata.position,
            division: bdata.division,
            placement: bdata.placement,
            tsTypes: [EEmployeeTimeTypes.WORK]
        }

        //проверка свободного времени и сохраняем запись брони, если оно успешно
        const res = await this.checkEmptySch(bookingDate, bk, async (duration) => {
            bookingRec.MData!.duration = duration;
            await bookingRec.save();
        }, forceUpdate);

        if (res) {
            const bookingDateStr = U.getDateStr(bookingDate);
            const gridDay = this._grid[bookingDateStr];
            const normTime = ~~(bk.begTime! / this._resolution);
            const normDuration = Math.ceil(bk.duration / this._resolution);

            //заносим данные брони в текущий grid
            for (let i = normTime; i < normTime + normDuration; i++)
                gridDay[i].bookings.push(BookingGridInfo.fromBookingListViewFactory(bdata, this._RecordsStore));
        }

        return res;
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
    protected _checkOverlayBooking(b1: IBookingListView, b2: IBookingListView, defDuration: number) {

        if (b2.begDate) {
            //не проверено
            const b1b = new Date(b1.begDate!).getTime();
            const b1e = b1b + (b1.duration || 0);
            const b2b = new Date(b2.begDate!).getTime();
            const b2e = b2b + (b2.duration || defDuration || 0);

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


    /**Проверка подходимости брони к расписанию*/
    protected _checkSchBookingMatch(sch: ScheduleTimespanItem, bk: TBookingParams) {

        let res = true;

        if (bk.tsTypes && bk.tsTypes.length > 0)
            if (!bk.tsTypes.includes(sch.getTimespan()!.getType()))
                return false;

        if ((sch.position || bk.position) && sch.position != bk.position)
            return false;

        if ((sch.division || bk.division) && sch.division != bk.division)
            return false;

        if ((sch.placement || bk.placement) && sch.placement != bk.placement)
            return false;

        if (bk.begTime != null) {
            const schb = sch.getTimespan()!.getTime();
            const sche = schb + sch.getTimespan()!.duration;

            const bkb = bk.begTime;
            const bke = bkb + (bk.duration || sch.defDuration || 0);

            if (bkb < schb || bke > sche)
                return false;
        }

        //проверка, что все требуемые продукты имеются в элементе расписания или если они не указаны, тогда подходят любые продукты
        const schProducts = sch.getProducts();
        if (bk.products && bk.products.length > 0 && schProducts && schProducts.length > 0)
            if (!bk.products.every(v => schProducts.includes(v)))
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

        const begMinutes = U.getMinutesOfDay(new Date(item.begDate!));
        res.timespan.setTime(begMinutes);
        res.timespan.setDuration(item.duration!);
        res.source = item;
        return res;
    }
}



export class ScheduleGridInfo {
    timespan: ScheduleTimeSpanEntity = null!;
    source: ScheduleTimespanItem = null!;


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


export type TBookingParams = {
    begTime?: number;  //время бронирования
    duration: number;
    position?: string | null;
    division?: string | null;
    placement?: string | null;
    products?: string[] | null;
    tsTypes?: EEmployeeTimeTypes[] | null; //тип промежутка времени в расписании
}


export type TGridQuerySch = {
    begDate: Date;  //начальная возможная дата бронирования
    endDate: Date;  //конечная возможная дата бронирования
    begTime: number;  //начальное возможное время бронирования
    endTime: number;  //конечное возможное время бронирования
    booking: TBookingParams
}



