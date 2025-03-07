import type {TDatedScheduleTimespanItems} from "~/lib/MoApi/ApiSectionsV1/SchedulerApiSection";
import {ScheduleEvent} from "~/components/customMonthView/SchedulerTypes";
import * as Utils from "~/lib/Utils";
import type ScheduleTimespanItem from "~/lib/MoApi/Records/DataEntities/ScheduleTimespanItem";
import {RecordsStore} from "~/lib/MoApi/Records/RecordsStore";
import type {MoApiClient} from "~/lib/MoApi/MoApiClient";
import {ScheduleApiSection} from "~/lib/MoApi/ApiSectionsV1/SchedulerApiSection";
import {BookingsViews} from "~/lib/MoApi/Views/BookingViews";
import {ScheduleItemGroupData} from "~/lib/MoApi/Records/ScheduleItemGroupRecord";
import {ProductRecord, ProductRecordData} from "~/lib/MoApi/Records/ProductRecord";
import {PositionRecord, PositionRecordData} from "~/lib/MoApi/Records/PositionRecord";
import {EmployeeRecord} from "~/lib/MoApi/Records/EmployeeRecord";
import {sleep} from "~/lib/Helpers";
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
    private startDayHours: number;
    private endDayHours: number;

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
        this.startDayHours = start;
        this.endDayHours = end;
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
        console.log(`Время построения, месяц: ${(performance.now() - start) / 1000} секунд`)
        return Array.from(monthViewSet);
    }

    public buildRangeScheduler() {
        const startBuild = performance.now()
        let availableSlots: ScheduleEvent[] = [];
        let unavailableSlots: ScheduleEvent[] = [];

        for (let key in this.currRangeData!) {
            let startHours = `${String(Math.floor(this.startDayHours / 60)).padStart(2, '0')}:${String(this.startDayHours % 60).padStart(2, '0')}`
            let endHours = `${String(Math.floor(this.endDayHours / 60)).padStart(2, '0')}:${String(this.endDayHours % 60).padStart(2, '0')}`
            let date = key;
            let dayData = this.currRangeData[key];
            let currDayData: ScheduleEvent[] = []

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
                    products: this.prodArr.filter(i => el.products?.includes(i.id.toString())),
                    title: '',
                    class: 'free_hours',
                    background: true,
                    split: this.positions.find((pos) => pos.id === el.position)?.employee,
                    resizable: false,
                    duration: 0
                };
                currDayData.push(freeTime)
                availableSlots.push(freeTime)
            })

            let splits = Array.from(new Set(currDayData.map(el => el.split)))
            splits.forEach( sp => {
                let srtdSlts = currDayData.filter( el => el.split === sp && el.start.slice(0, 10) === date)
                srtdSlts.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

                let frstBusy: ScheduleEvent = {
                    startTime: this.startDayHours,
                    endTime: srtdSlts[0].startTime,
                    start: key + ' ' + startHours,
                    end: srtdSlts[0].start ,
                    products: srtdSlts[0].products,
                    title: '',
                    class: 'not_working_hours',
                    background: true,
                    split: sp,
                    resizable: false,
                    duration: srtdSlts[0].startTime - this.startDayHours
                }

                unavailableSlots.push(frstBusy)

                for(let i = 0; i < srtdSlts.length-1; i++) {
                    let slt = srtdSlts[i];
                    let nxtSlt = srtdSlts[i + 1];

                    let bs: ScheduleEvent = {
                        startTime: slt.endTime,
                        endTime: nxtSlt.startTime,
                        start: slt.end,
                        end: nxtSlt.start ,
                        products: slt.products,
                        title: '',
                        class: 'not_working_hours',
                        background: true,
                        split: sp,
                        resizable: false,
                        duration: nxtSlt.startTime - slt.endTime
                    }
                    unavailableSlots.push(bs)
                }
            })

        }

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
        console.log(`Время построения, неделя: ${(performance.now() - startBuild) / 1000} секунд`)
        return {availableSlots, unavailableSlots}
    };

    // public findNearestTime (selData: ScheduleEvent, prods: ProductDataSchedule[], availableTimes: ScheduleEvent[], busyTime: ScheduleEvent[], single: boolean = true) {
    //     return prods.map(pr => {
    //         let fitSlots = availableTimes.filter(el =>
    //             el.products.find(p => typeof p === 'object' && p.id == pr.id)
    //             && ((this.timeToMinutes(el.end.slice(11))/60 <= (selData.endTime + pr.duration/60)) || (this.timeToMinutes(el.start.slice(11))/60 + pr.duration/60 <= selData.endTime))
    //         )
    //
    //         if(single){
    //             fitSlots.map(f => {
    //
    //                 let splitBusyTime = busyTime.filter(sp => sp.split === f.split)
    //                 pr.split = f.split!.toString();
    //                 if(splitBusyTime.length > 0){
    //                     let busy = splitBusyTime.filter(b => b.start >= f.start && b.end <= f.end)
    //
    //                     if(busy.length > 0){
    //                         busy.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    //                         for (let i = 0; i < busy.length - 1; i++) {
    //                             const busy1Start = this.timeToMinutes(busy[0].start.slice(11));
    //                             const freeStart = this.timeToMinutes(f.start.slice(11));
    //                             if(busy1Start-freeStart >= pr.duration){
    //                                 pr.start = f.start;
    //                                 pr.time = f.start.slice(11);
    //                                 break;
    //                             }
    //
    //                             const busy1End = new Date(busy[i].end);
    //                             const busy2Start = new Date(busy[i + 1].start);
    //
    //                             const differenceInMinutes = (busy2Start.getTime() - busy1End.getTime()) / (1000 * 60);
    //
    //                             if (differenceInMinutes >= pr.duration) {
    //                                 pr.start = busy1End;
    //                                 pr.time = busy1End.toString().slice(11, 16)
    //                                 break;
    //                             }
    //                         }
    //                     } else {
    //                         if((this.timeToMinutes(f.end.slice(11)) - this.timeToMinutes(f.start.slice(11))) >= pr.duration){
    //                             pr.start = f.start;
    //                             pr.time = f.start.slice(11);
    //                         }
    //                     }
    //                     if (!pr.start && busy.length > 0) {
    //                         const lastBusySlot = busy[busy.length - 1];
    //                         if ((new Date(f.end).getTime() - new Date(lastBusySlot.end).getTime())/60000 >= pr.duration) {
    //                             pr.start = lastBusySlot.end;
    //                             pr.time = lastBusySlot.end.slice(11);
    //                         }
    //                     }
    //                 } else {
    //                     if((this.timeToMinutes(f.end.slice(11)) - this.timeToMinutes(f.start.slice(11))) >= pr.duration){
    //                         pr.start = f.start;
    //                         pr.time = f.start.slice(11);
    //                     }
    //                 }
    //             })
    //             return pr
    //         } else {
    //             let freeTimeArr: any[] = [];
    //
    //             let uniqDates = Array.from( new Set(fitSlots.filter((obj, index, self) =>
    //                     index === self.findIndex((t) => (
    //                         t.split === obj.split && t.start.slice(0, 10) === obj.start.slice(0, 10)
    //                     ))
    //             )));
    //             const checkHoursOverlap = (endTime1, startTime2, nonWorkingHours) => {
    //                 for (let hours of nonWorkingHours) {
    //                     let nonWorkingStart = this.timeToMinutes(hours.start.slice(11));
    //                     let nonWorkingEnd = this.timeToMinutes(hours.end.slice(11));
    //                     if (endTime1 < nonWorkingEnd && startTime2 > nonWorkingStart) {
    //
    //                         return true;
    //                     }
    //                 }
    //                 return false;
    //             }
    //             uniqDates.map(f => {
    //                 let splitBusyTime = busyTime.filter(sp => sp.split === f.split && sp.start.slice(0, 10) == f.start.slice(0, 10))
    //
    //                 if(splitBusyTime.length > 0){
    //
    //                     let nWH = splitBusyTime.filter( el => el.class == 'not_working_hours')
    //                     let bks = splitBusyTime.filter( el => el.class == 'ordered')
    //                     nWH.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    //                     bks.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    //
    //                     for (let i = 0; i < bks.length - 1; i++) {
    //
    //                         let busyEnd = this.timeToMinutes(bks[i].start.slice(11));
    //                         console.log(busyEnd)
    //                         if(bks[i+1]){
    //
    //                             let nextBusyStart = this.timeToMinutes(bks[i+1].start.slice(11));
    //                             let isOverlap = checkHoursOverlap(busyEnd, nextBusyStart, nWH )
    //                             if(nextBusyStart - busyEnd >= pr.duration && bks[i+1] !== bks[bks.length - 1]){
    //
    //                                 f.start = bks[i].end;
    //                                 let nf = {...f}
    //                                 freeTimeArr.push(nf)
    //                             }
    //                         }
    //                     }
    //                 }
    //             })
    //             freeTimeArr = Array.from(new Set(freeTimeArr))
    //             return freeTimeArr
    //         }
    //     })
    // }
    public findNearestTime(
        selData: ScheduleEvent,
        prods: ProductDataSchedule[],
        availableTimes: ScheduleEvent[],
        busyTime: ScheduleEvent[],
        single: boolean = true
    ) {
        return prods.map(pr => {
            let fitSlots = availableTimes.filter(el => {
                let startMinutes = this.timeToMinutes(el.start.slice(11)); // Начало слота в минутах
                let endMinutes = this.timeToMinutes(el.end.slice(11)); // Конец слота в минутах

                let selStartMinutes = selData.startTime * 60; // Начало заданного интервала
                let selEndMinutes = selData.endTime * 60; // Конец заданного интервала

                return (
                    el.products.some(p => typeof p === 'object' && p.id === pr.id) &&
                    (endMinutes - startMinutes >= pr.duration) &&
                    (startMinutes >= selStartMinutes && endMinutes <= selEndMinutes) // Проверяем, попадает ли слот во временной диапазон
                );
            });

            if (single) {
                fitSlots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

                for (let f of fitSlots) {
                    let splitBusyTime = busyTime.filter(sp => sp.split === f.split);
                    pr.split = f.split!.toString();

                    if (splitBusyTime.length > 0) {
                        let busy = splitBusyTime.filter(b => b.start >= f.start && b.end <= f.end);
                        busy.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

                        if (busy.length === 0) {
                            pr.start = f.start;
                            pr.time = f.start.slice(11);
                            break;
                        } else {
                            for (let i = 0; i < busy.length - 1; i++) {
                                let busy1End = this.timeToMinutes(busy[i].end.slice(11));
                                let busy2Start = this.timeToMinutes(busy[i + 1].start.slice(11));
                                if (busy2Start - busy1End >= pr.duration) {
                                    pr.start = busy[i].end;
                                    pr.time = busy[i].end.slice(11, 16);
                                    break;
                                }
                            }
                        }
                    } else {
                        pr.start = f.start;
                        pr.time = f.start.slice(11);
                        break;
                    }
                }

                return pr;
            } else {
                let freeTimeArr: ScheduleEvent[] = [];

                let uniqDates = Array.from(new Set(
                    fitSlots.filter((obj, index, self) =>
                        index === self.findIndex((t) => t.split === obj.split && t.start.slice(0, 10) === obj.start.slice(0, 10))
                    )
                ));

                const checkHoursOverlap = (endTime1, startTime2, nonWorkingHours) => {
                    return nonWorkingHours.some(hours => {
                        let nonWorkingStart = this.timeToMinutes(hours.start.slice(11));
                        let nonWorkingEnd = this.timeToMinutes(hours.end.slice(11));
                        return endTime1 < nonWorkingEnd && startTime2 > nonWorkingStart;
                    });
                };

                uniqDates.forEach(f => {
                    let splitBusyTime = busyTime.filter(sp => sp.split === f.split && sp.start.slice(0, 10) === f.start.slice(0, 10));

                    if (splitBusyTime.length > 0) {
                        let nonWorkingHours = splitBusyTime.filter(el => el.class === 'not_working_hours');
                        let bookings = splitBusyTime.filter(el => el.class === 'ordered');

                        nonWorkingHours.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
                        bookings.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

                        for (let i = 0; i < bookings.length - 1; i++) {
                            let busyEnd = this.timeToMinutes(bookings[i].end.slice(11));
                            if (bookings[i + 1]) {
                                let nextBusyStart = this.timeToMinutes(bookings[i + 1].start.slice(11));
                                let isOverlap = checkHoursOverlap(busyEnd, nextBusyStart, nonWorkingHours);
                                if (!isOverlap && nextBusyStart - busyEnd >= pr.duration) {
                                    let nf = { ...f, start: bookings[i].end };
                                    freeTimeArr.push(nf);
                                }
                            }
                        }

                        let lastBooking = bookings[bookings.length - 1];
                        if (lastBooking && (this.timeToMinutes(f.end.slice(11)) - this.timeToMinutes(lastBooking.end.slice(11))) >= pr.duration) {
                            freeTimeArr.push({ ...f, start: lastBooking.end });
                        }
                    }
                });

                return Array.from(new Set(freeTimeArr));
            }
        });
    }

    public getCurrentRangeData(): TDatedScheduleTimespanItems | null {
        return this.currRangeData;
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

    private getProductsList = async (k: string[]): Promise<any[]> => {
        const chunkSize = 100; // Размер чанка
        const delay = 200; // Задержка между запросами (мс)
        const keys = k.map((id) => id.replaceAll(`'`, `"`)); // Очистка ключей
        const chunks = Array.from({ length: Math.ceil(keys.length / chunkSize) }, (_, index) =>
            keys.slice(index * chunkSize, (index + 1) * chunkSize)
        );

        const recs: any[] = [];
        for (const chunk of chunks) {
            const chunkRecs = await Promise.allSettled(
                chunk.map(async (i) => {
                    await sleep(delay); // Задержка перед каждым запросом
                    try {
                        const record = await this.recStore.getRecordsM([{ id: { key: i, type: ProductRecord } }]);
                        return record[0].MData;
                    } catch (error) {
                        console.error(`Error fetching record with key ${i}:`, error);
                        return null; // Возвращаем null для неудачных запросов
                    }
                })
            );

            // Сохраняем только успешные результаты
            recs.push(
                ...chunkRecs
                    .filter((result) => result.status === 'fulfilled' && result.value !== null)
                    .map((result: PromiseFulfilledResult<any>) => result.value)
            );
        }

        return recs;
    };


    private getEmployeeList = async (k: string[]): Promise<any[]> => {
        const chunkSize = 100;
        const delay = 200; // Задержка между запросами
        const keys = k.map((id) => id.replaceAll(`'`, `"`));
        const emplsRec: any[] = [];

        const totalChunks = Math.ceil(keys.length / chunkSize);
        for (let i = 0; i < totalChunks; i++) {
            const chunkKeys = keys.slice(i * chunkSize, (i + 1) * chunkSize);
            await sleep(delay); // Задержка перед запросами

            try {
                const recs = await this.recStore.getRecords<PositionRecord>(PositionRecord, chunkKeys);
                this.positions = Array.from(recs.map((i) => i.MData));

                const emplsKeys = recs
                    .map((i) => i.MData)
                    .map((el: any) => el.employee.replaceAll(`'`, `"`));

                const chunkEmplsRec = await this.recStore.getRecords<EmployeeRecord>(EmployeeRecord, emplsKeys);
                emplsRec.push(...chunkEmplsRec);
            } catch (error) {
                console.error(`Error fetching employee records for chunk ${i + 1}/${totalChunks}:`, error);
            }
        }
        return emplsRec.map((i) => i.MData);
    };

    private timeToMinutes (time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
}



