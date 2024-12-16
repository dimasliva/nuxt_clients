import type {TDatedScheduleTimespanItems} from "~/lib/MoApi/ApiSectionsV1/SchedulerApiSection";
import {ScheduleEvent} from "~/components/customMonthView/SchedulerTypes";
import * as Utils from "~/lib/Utils";
import type ScheduleTimespanItem from "~/lib/MoApi/Records/DataEntities/ScheduleTimespanItem";
import {RecordsStore} from "~/lib/MoApi/Records/RecordsStore";
import type {MoApiClient} from "~/lib/MoApi/MoApiClient";
import {ScheduleApiSection} from "~/lib/MoApi/ApiSectionsV1/SchedulerApiSection";
import {BookingsViews} from "~/lib/MoApi/Views/BookingViews";
import {ScheduleItemGroupData} from "~/lib/MoApi/Records/SchedulerItemGroupRecord";
import {ProductRecord, ProductRecordData} from "~/lib/MoApi/Records/ProductRecord";
import {PositionRecord, PositionRecordData} from "~/lib/MoApi/Records/PositionRecord";
import {EmployeeRecord} from "~/lib/MoApi/Records/EmployeeRecord";
import positions from "~/pages/list/positions.vue";

interface ProductDataSchedule extends ProductRecordData{
    start: string | Date;
    time: string;
    split: string;
}

export class Scheduler {
    private recStore: RecordsStore;
    private apiClient: MoApiClient;
    private schItemGroup: ScheduleApiSection;
    private slctdSchItemGroupData: ScheduleItemGroupData | { value: string, title: string } | null;
    private currRangeData: TDatedScheduleTimespanItems | null;
    public positions: PositionRecordData[];
    public empArr: any[];
    public prodArr: any[];
    private startHours: number;
    private endHours: number;

    constructor(start: number, end: number) {
        const iocc = useContainer();
        this.recStore = iocc.get(RecordsStore);
        this.apiClient = iocc.get<MoApiClient>("MoApiClient");
        this.schItemGroup = iocc.get(ScheduleApiSection);
        this.slctdSchItemGroupData = null;
        this.currRangeData = null;
        this.positions = [];
        this.empArr = [];
        this.prodArr = [];
        this.startHours = start;
        this.endHours = end;
    }

    public async getScheduler(minDate: string, maxDate: string, employees?: string[] | null, products?: string[] | null, divisions?: string[] | null) {

        const res = await this.schItemGroup.getSchedule({
            begDate: minDate,
            endDate: maxDate,
            productIds: products,
            positionIds: employees,
            divisionIds: divisions? divisions : null,
            placementIds: null
        });
        this.currRangeData = res
        this.processScheduleData(res);
        return this
    }

    public async getScheduleByItemGroup(slctdSchItemGroup: ScheduleItemGroupData | { value: string, title: string }, minDate: Date, maxDate: Date) {
        this.slctdSchItemGroupData = slctdSchItemGroup
        let res = await this.schItemGroup.getScheduleByItemGroup(minDate, maxDate, (this.slctdSchItemGroupData as {
            value: string
        }).value)
        let sch: any = res
        this.currRangeData = res

        await this.processScheduleData(res);

        return this
    }

    private async processScheduleData(res: any) {
        this.currRangeData = res;
        let prods: any = [];
        let empls: any = [];

        Object.values(res).flat().forEach((el: any) => {
            prods.push(el.products);
            empls.push(el.position);
        });

        prods = Array.from(new Set(prods.flat()));
        this.prodArr = await this.getProductsList(prods);

        empls = Array.from(new Set(empls));
        this.empArr= Array.from(await this.getEmployeeList(empls));

        this.empArr.forEach((empl) => {
            empl.label = `${empl.surname} ${empl.name[0].toUpperCase()}. ${empl.patronymic ? empl.patronymic[0] + '.' : ''}`;
        });

        return this
    }

    public buildMonthScheduler (employees?: string[], products?: string[]) {
        const start = performance.now()
        const dates: string[] = Object.keys(this.currRangeData!);
        const times: ScheduleTimespanItem[][] = Object.values(this.currRangeData!);
        const monthViewSet = new Set<ScheduleEvent>();

        for (let i = 0; i < dates.length; i++) {
            const date = dates[i];
            const timeItems = times[i];

            if (timeItems.length > 0) {
                let quantity = 0;
                let list: { id: string, title: string, quantity: number, duration: number }[] = [];

                for (let ind = 0; ind < timeItems.length; ind++) {
                    const item = timeItems[ind];
                    const nextItem = timeItems[ind + 1];
                    const dayTimeSpan = this.timeOfDay(item.timespan!.time);
                    const dayTimeSpanNext = nextItem ? this.timeOfDay(nextItem.timespan!.time) : null;
                    const isSameDayTime = dayTimeSpan == dayTimeSpanNext;
                    const {start, end} = this.hoursSpanAdder(dayTimeSpan);

                    const adderFunc = (cond: boolean) => {
                        if (cond) {
                            quantity++
                            list = this.addToListOfProds(list, item);
                        }
                        if (!isSameDayTime) {
                            let status = this.crtStatus(quantity);
                            monthViewSet.add(new ScheduleEvent(date, date, list, dayTimeSpan, start, end, status))
                            quantity = 0
                            list = []
                        }
                    }
                    const adderDefFunc = () => {
                        quantity++
                        list = this.addToListOfProds(list, item);
                        let status = this.crtStatus(quantity);
                        if (!isSameDayTime) {
                            monthViewSet.add(new ScheduleEvent(date, date, list, dayTimeSpan, start, end, status))
                            quantity = 0
                            list = []
                        }
                    }
                    if (this.slctdSchItemGroupData) {
                        if ((products ?? []).length > 0 && !((employees ?? []).length > 0)) {
                            adderFunc(this.hasProdInTimes(products!, item))
                        } else if ((employees ?? []).length > 0 && !((products ?? []).length > 0)) {
                            adderFunc(this.hasEmplsInTimes(employees!, item))
                        } else if ((products ?? []).length > 0 && (employees ?? []).length > 0) {
                            adderFunc(this.hasEmplsInTimes(employees!, item) && this.hasProdInTimes(products!, item))
                        } else {
                            adderDefFunc();
                        }
                    } else {
                        adderDefFunc();
                    }
                }
            }
        }
        console.log(`Время загрузки расписания: ${performance.now() - start}`)
        return Array.from(monthViewSet);
    }

    public buildRangeScheduler(
        start: Date,
        end: Date,
    ) {
        let availableSlots: ScheduleEvent[] = [];
        let unavailableSlots: ScheduleEvent[] = [];

        for (let key in this.currRangeData!) {

            let date = key;
            let dayData = this.currRangeData[key];

            dayData.map(el =>{
                const startTime = el.timespan!.time;
                const endTime = startTime + el.timespan!.duration;
                const startHours = Math.floor(startTime / 60);
                const startMinutes = startTime % 60;
                let endHours = Math.floor(endTime / 60);
                const endMinutes = endTime % 60;

                let newDate = new Date(date).format('YYYY-MM-DD')
                if(endHours == 24){
                    newDate = new Date(newDate).addDays(1).format('YYYY-MM-DD')
                    endHours = 0
                }

                const freeTime: ScheduleEvent = {
                    startTime: startTime,
                    endTime: endTime,
                    start: `${date + ' '}${startHours < 10 ? '0' + startHours : startHours}:${startMinutes < 10 ? '0' + startMinutes : startMinutes}`,
                    end: `${newDate + ' '}${endHours < 10 ? '0' + endHours : endHours}:${endMinutes < 10 ? '0' + endMinutes : endMinutes}`,
                    products: this.prodArr.filter(i => el.products?.includes(i.id)),
                    title: '',
                    class: 'free_hours',
                    background: true,
                    split: this.positions.find((pos) => pos.id === el.position)?.employee,
                    resizable: false,
                    duration: 0
                };
                availableSlots.push(freeTime)
            })
        }

        let splits = Array.from(new Set(availableSlots.map(el => el.split)))
        splits.forEach( sp => {
            let srtdSlts = availableSlots.filter( el => el.split === sp)

            srtdSlts.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

            for(let i = 0; i < srtdSlts.length-1; i++){
                let slt = srtdSlts[i];
                let nxtSlt = srtdSlts[i+1];
                let isSlotting = slt.endTime >= nxtSlt.startTime

                let bs: ScheduleEvent = {
                    startTime: slt.endTime,
                    endTime: isSlotting ? nxtSlt.endTime : nxtSlt.startTime,
                    start: slt.end,
                    end: isSlotting ? nxtSlt.end : nxtSlt.start ,
                    products: slt.products,
                    title: '',
                    class: 'not_working_hours',
                    background: true,
                    split: sp,
                    resizable: false,
                    duration: 0
                }
                if(i == 0){
                    if(bs.startTime > this.startHours * 60){
                        let frstBs = {...bs}
                        frstBs.startTime = 0
                        frstBs.endTime = this.startHours * 60
                        frstBs.start = new Date(bs.start)
                        frstBs.start.setHours(0)
                        frstBs.start.setMinutes(0)
                        frstBs.start = frstBs.start.format('YYYY-MM-DD HH:mm')
                        let end: any = new Date(bs.end)
                        end.setHours(Math.floor(frstBs.endTime / 60))
                        end.setMinutes(frstBs.endTime % 60)
                        frstBs.end = end.format('YYYY-MM-DD HH:mm')
                        console.log(frstBs)
                        unavailableSlots.push(frstBs)
                    }
                }
                if(isSlotting){
                    i++
                }
                unavailableSlots.push(bs)
                if(i == srtdSlts.length-1){
                    if(bs.endTime < this.endHours * 60) {
                        let lstBs = {...bs}
                        lstBs.startTime = this.endHours * 60
                        lstBs.endTime = 1439
                        let start: any = new Date(bs.start)
                        start.setHours(Math.floor(lstBs.startTime / 60))
                        start.setMinutes(lstBs.startTime % 60)
                        lstBs.start = start.format('YYYY-MM-DD HH:mm')
                        lstBs.end = new Date(bs.end)
                        lstBs.end.setHours(23)
                        lstBs.end.setMinutes(59)
                        lstBs.end.format('YYYY-MM-DD HH:mm')
                        console.log(lstBs)
                        unavailableSlots.push(lstBs)
                    }
                }
            }
        })
        for(let i = 0; i < unavailableSlots.length-1; i++){
            let bs = unavailableSlots[i];
            let nxtBs = unavailableSlots[i+1];

            if(bs.split === nxtBs.split){
                if(bs.endTime < bs.startTime){
                    bs.end = nxtBs.start
                    bs.endTime = nxtBs.startTime
                }
            }
        }
        console.log(unavailableSlots)
        // let startDay = Utils.getDateStr(start).toString();
        // let endDay = Utils.getDateStr(end).toString();
        //
        // const keys = Object.keys(this.currRangeData!).sort();
        // const keysInRange = keys.filter(key => key >= startDay && key <= endDay);
        //
        // const result = keysInRange.reduce((acc, key) => {
        //     acc[key] = this.currRangeData![key];
        //     return acc;
        // }, {});
        //
        // const dates: string[] = Object.keys(result);
        // const times: ScheduleTimespanItem[][] = Object.values(result);
        // const unavailableSlots: ScheduleEvent[] = [];
        // const availableSlots: ScheduleEvent[] = [];
        //
        // const newStart = '0' + this.startHours + ':00';
        // const newEnd = this.endHours + ':00';
        //
        // for (let i = 0; i < dates.length; i++) {
        //     let date = dates[i];
        //     const timeItems = times[i];
        //
        //     timeItems.forEach((item) => {
        //
        //         const startTime = item.timespan!.time;
        //         const endTime = startTime + item.timespan!.duration;
        //         const startHours = Math.floor(startTime / 60);
        //         const startMinutes = startTime % 60;
        //         let endHours = Math.floor(endTime / 60);
        //         const endMinutes = endTime % 60;
        //         const freeTime: ScheduleEvent = {
        //             endTime: endTime,
        //             startTime: startTime,
        //             start: '',
        //             end: '',
        //             products: this.prodArr.filter(i => item.products?.includes(i.id)),
        //             title: '',
        //             class: 'free_hours',
        //             background: true,
        //             split: '',
        //             resizable: false,
        //             duration: 0
        //         };
        //
        //         const start = `${date + ' '}${startHours < 10 ? '0' + startHours : startHours}:${startMinutes < 10 ? '0' + startMinutes : startMinutes}`;
        //         let newDate = new Date(date).format('YYYY-MM-DD')
        //         if(endHours == 24){
        //             newDate = new Date(newDate).addDays(1).format('YYYY-MM-DD')
        //             endHours = 0
        //         }
        //         const end = `${newDate + ' '}${endHours < 10 ? '0' + endHours : endHours}:${endMinutes < 10 ? '0' + endMinutes : endMinutes}`;
        //
        //         const split = this.positions.find((pos) => pos.id === item.position)?.employee;
        //         const spans = this.spansInSplit(availableSlots, split!, date)
        //
        //         if (spans.length > 0) {
        //             const lastSpan = spans[spans.length - 1];
        //             if (lastSpan!.end >= start && lastSpan!.end <= end) {
        //                 lastSpan!.end = end;
        //             } else if (lastSpan!.end >= end && lastSpan!.start <= start) {
        //                 return
        //             } else if (lastSpan!.end < end && lastSpan!.start < start) {
        //                 freeTime.start = start;
        //                 freeTime.end = end;
        //                 freeTime.split = split;
        //                 availableSlots.push(freeTime);
        //             }
        //         } else {
        //             freeTime.start = start;
        //             freeTime.end = end;
        //             freeTime.split = split;
        //             availableSlots.push(freeTime);
        //         }
        //
        //     });
        //
        //     for (let j = 0; j < this.empArr.length; j++) {
        //         const busyTime: ScheduleEvent = {
        //             start: date + ' ' + newStart,
        //             end: date + ' ' + newEnd,
        //             title: '',
        //             class: 'not_working_hours',
        //             background: true,
        //             split: this.empArr[j].id,
        //             resizable: false
        //         };
        //         unavailableSlots.push(busyTime)
        //     }
        // }
        //
        // for (let i = 0; i < availableSlots.length - 1; i++) {
        //     const busyTime: ScheduleEvent = {
        //         start: availableSlots[i].start.slice(0, -6) + ' ' + newStart,
        //         end: availableSlots[i].end.slice(0, -6) + ' ' + newEnd,
        //         title: '',
        //         class: 'not_working_hours',
        //         background: true,
        //         split: '',
        //         resizable: false
        //     };
        //     let currEl = availableSlots[i]
        //     let foundedSpans = this.spansInSplit(unavailableSlots, currEl.split!, currEl.start.slice(0, -6))
        //     if (foundedSpans.length > 0) {
        //         const lastSpan = foundedSpans[foundedSpans.length - 1];
        //         if (currEl.start >= lastSpan.start) {
        //             lastSpan.end = currEl.start
        //             busyTime.start = currEl.end
        //             busyTime.split = currEl.split
        //             unavailableSlots.push(busyTime)
        //         }
        //     }
        //
        // }
        return {availableSlots, unavailableSlots}
    };

    public findNearestTime (selData: ScheduleEvent, prods: ProductDataSchedule[], availableTimes: ScheduleEvent[], busyTime: ScheduleEvent[], single: boolean = true) {
        return prods.map(pr => {
            let fitSlots = availableTimes.filter(el =>
                el.products.find(p => typeof p === 'object' && p.id == pr.id)
                && ((this.timeToMinutes(el.end.slice(11))/60 <= (selData.endTime + pr.duration/60)) || (this.timeToMinutes(el.start.slice(11))/60 + pr.duration/60 <= selData.endTime))
            )
            if(single){
                fitSlots.map(f => {

                    let splitBusyTime = busyTime.filter(sp => sp.split === f.split)
                    pr.split = f.split!.toString();
                    if(splitBusyTime.length > 0){
                        let busy = splitBusyTime.filter(b => b.start >= f.start && b.end <= f.end)

                        if(busy.length > 0){
                            busy.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                            for (let i = 0; i < busy.length - 1; i++) {
                                const busy1Start = this.timeToMinutes(busy[0].start.slice(11));
                                const freeStart = this.timeToMinutes(f.start.slice(11));
                                if(busy1Start-freeStart >= pr.duration){
                                    pr.start = f.start;
                                    pr.time = f.start.slice(11);
                                    break;
                                }

                                const busy1End = new Date(busy[i].end);
                                const busy2Start = new Date(busy[i + 1].start);

                                const differenceInMinutes = (busy2Start.getTime() - busy1End.getTime()) / (1000 * 60);

                                if (differenceInMinutes >= pr.duration) {
                                    pr.start = busy1End;
                                    pr.time = busy1End.toString().slice(11, 16)
                                    break;
                                }
                            }
                        } else {
                            if((this.timeToMinutes(f.end.slice(11)) - this.timeToMinutes(f.start.slice(11))) >= pr.duration){
                                pr.start = f.start;
                                pr.time = f.start.slice(11);
                            }
                        }
                        if (!pr.start && busy.length > 0) {
                            const lastBusySlot = busy[busy.length - 1];
                            if ((new Date(f.end).getTime() - new Date(lastBusySlot.end).getTime())/60000 >= pr.duration) {
                                pr.start = lastBusySlot.end;
                                pr.time = lastBusySlot.end.slice(11);
                            }
                        }
                    } else {
                        if((this.timeToMinutes(f.end.slice(11)) - this.timeToMinutes(f.start.slice(11))) >= pr.duration){
                            pr.start = f.start;
                            pr.time = f.start.slice(11);
                        }
                    }
                })
                return pr
            } else {
                let freeTimeArr: any[] = [];

                let uniqDates = Array.from( new Set(fitSlots.filter((obj, index, self) =>
                        index === self.findIndex((t) => (
                            t.split === obj.split && t.start.slice(0, 10) === obj.start.slice(0, 10)
                        ))
                )));
                const checkHoursOverlap = (endTime1, startTime2, nonWorkingHours) => {
                    for (let hours of nonWorkingHours) {
                        let nonWorkingStart = this.timeToMinutes(hours.start.slice(11));
                        let nonWorkingEnd = this.timeToMinutes(hours.end.slice(11));
                        if (endTime1 < nonWorkingEnd && startTime2 > nonWorkingStart) {

                            return true;
                        }
                    }
                    return false;
                }
                uniqDates.map(f => {
                    let splitBusyTime = busyTime.filter(sp => sp.split === f.split && sp.start.slice(0, 10) == f.start.slice(0, 10))

                    if(splitBusyTime.length > 0){

                        let nWH = splitBusyTime.filter( el => el.class == 'not_working_hours')
                        let bks = splitBusyTime.filter( el => el.class == 'ordered')
                        nWH.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                        bks.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

                        for (let i = 0; i < bks.length - 1; i++) {

                            let busyEnd = this.timeToMinutes(bks[i].start.slice(11));
                            if(bks[i+1]){

                                let nextBusyStart = this.timeToMinutes(bks[i+1].start.slice(11));
                                let isOverlap = checkHoursOverlap(busyEnd, nextBusyStart, nWH )
                                if(nextBusyStart - busyEnd >= pr.duration && bks[i+1] !== bks[bks.length - 1]){

                                    f.start = bks[i].end;
                                    let nf = {...f}
                                    freeTimeArr.push(nf)
                                }
                            }
                        }
                    }
                })
                freeTimeArr = Array.from(new Set(freeTimeArr))
                return freeTimeArr
            }
        })
    }

    private hoursSpanAdder (daytime) {
        let start = 0
        let end = 0

        if (daytime === 'Утро') {
            start = 7
            end = 12
        }
        if (daytime === 'День') {
            start = 12
            end = 17
        }
        if (daytime === 'Вечер') {
            start = 17
            end = 21
        }

        return {start, end}
    }

    private timeOfDay (mins: number) {
        if (mins < 720) {
            return 'Утро'
        }

        if (mins < 1080) {
            return 'День'
        }

        if (mins < 1440) {
            return 'Вечер'
        }

    }

    private addToListOfProds (arr, i) {
        i.products?.forEach((product) => {
            const existingProduct = arr.find((prod) => prod.id === product);
            if (existingProduct) {
                existingProduct.quantity++;
            } else {
                arr.push({id: product, title: '', quantity: 1, duration: 0, split: i.position});
            }
        });
        return arr;
    }

    private spansInSplit(arr: ScheduleEvent[], split: string, date: string) {
        return arr.filter(i => i.split === split && i.start.slice(0, -6) === date);
    }

    private crtStatus (q)  {
        let sts = ''
        if (q > 0) {
            sts = 'available'
        } else {
            sts = 'none'
        }
        return sts;
    }

    private hasProdInTimes = (arr, i, cond?) => arr.some(prod => i.products?.includes(prod.id!) && (prod.duration <= (cond ? cond : i.timespan.duration)));

    private hasEmplsInTimes = (arr, i) => this.positions.some((pos) => arr.some(empl => empl.id === pos.employee) && pos.id === i.position);

    private getProductsList = async (k) => {
        const chunkSize = 500; // Устанавливаем размер чанка
        const keys = k.map((id) => id.replaceAll(`'`, `"`));
        const chunks = Array.from({length: Math.ceil(keys.length / chunkSize)}, (_, index) =>
            keys.slice(index * chunkSize, (index + 1) * chunkSize)
        );

        let recs: any[] = [];
        for (const chunk of chunks) {
            const chunkRecs = await Promise.all(chunk.map(async (i) => {
                try {
                    let record = await this.recStore.getRecordsM([{id: {key: i, type: ProductRecord}}]);
                    return record[0].MData;
                } catch (error) {
                    console.error(`An error occurred while fetching record with key ${i}:`, error);
                    return null; // Возвращаем null для не найденных записей
                }
            }));
            recs.push(...chunkRecs);
        }

        return recs.filter((i) => i !== null);
    }

    private getEmployeeList = async (k) => {
        let keys = k.map((id) => id.replaceAll(`'`, `"`))
        let emplsRec: any[] = [];

        const chunkSize = 500;
        const totalChunks = Math.ceil(keys.length / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
            const chunkKeys = keys.slice(i * chunkSize, (i + 1) * chunkSize);
            let recs = await this.recStore.getRecords<PositionRecord>(PositionRecord, chunkKeys);
            this.positions = Array.from(recs.map(i => i.MData));
            let emplsKeys = recs.map(i => i.MData).map((el: any) => el.employee.replaceAll(`'`, `"`));
            let chunkEmplsRec = await this.recStore.getRecords<EmployeeRecord>(EmployeeRecord, emplsKeys);
            emplsRec.push(...chunkEmplsRec);
        }

        return emplsRec.map(i => i.MData);
    }

    private timeToMinutes (time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
}



