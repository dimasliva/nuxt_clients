import type {IBookingListView} from "~/lib/MoApi/Views/BookingViews";
import {ScheduleEvent} from "~/components/customMonthView/SchedulerTypes";
import * as Utils from "~/lib/Utils";
import {BookingsViews} from "~/lib/MoApi/Views/BookingViews";
import type {IPositionListView} from "~/lib/MoApi/Views/PositionsViews";

export class Bookings {
    private bookingViews: BookingsViews;
    private minDate: Date;
    private maxDate: Date;
    private positions: IPositionListView[] | null;

    constructor(minDate: Date, maxDate: Date, positions: IPositionListView[] | null) {
        const iocc = useContainer();
        this.bookingViews = iocc.get(BookingsViews);
        this.minDate = minDate;
        this.maxDate = maxDate;
        this.positions = positions

    }

    public async getBookingsRecs () {
        const positionsIds: string[] | null = this.positions? this.positions.map(pos => pos.id!) : null
        const bookingArr: IBookingListView[] = []

        let res = await this.bookingViews.getBookings({
            begDate: Utils.getDateStr(this.minDate),
            endDate: Utils.getDateStr(this.maxDate),
            positionIds: positionsIds,
            includeNames: true,
            includePlace: true,
            includeStatus: true,
        })
        for(let i = 0; i< res.getLength(); i++){
            bookingArr.push(res.getRow(i)!)
        }

        return this.createBookingsFromApi(bookingArr)
    }

    private createBookingsFromApi (bookingArr: IBookingListView[]) {
        let bookingsArr: ScheduleEvent[] = [];
        let status = {
            1: {icon: 'mdi-account', title: 'Заказано', class: 'ordered'},
            2: {icon: 'mdi-pencil', title: 'Выполнено', class: 'executed'},
            3: {icon: 'mdi-cancel', title: 'Отменено', class: 'canceled'},
        }

        for(let i = 0; i < bookingArr.length; i++){
            let currEl = bookingArr[i]

            let event: ScheduleEvent = {
                start: new Date(currEl.begDate!).format('YYYY-MM-DD HH:mm'),
                end: new Date(new Date(currEl.begDate!).getTime() + currEl.duration! * 60000).format('YYYY-MM-DD HH:mm'),
                products: currEl.product ? currEl.product.split(',') : [currEl.productGroup],
                background: false,
                title: currEl.client && !currEl.clientGroup ? currEl.clientSurname!+ ' ' + currEl.clientName : 'Группа',
                split: this.positions ? this.positions.find((pos) => pos.id === currEl.position).employee! : currEl.position,
                class: status[currEl.status!].class,
                duration: currEl.duration,
                client: {id: currEl.client!, name: currEl.clientName!, surname: currEl.clientSurname!, patronymic: currEl.clientPatronymic!, phone: '' },
                id: currEl.id!,
                content: currEl.productTitle ? currEl.productTitle : currEl.productGroupTitle,
            }
            bookingsArr.push(event)
        }
       return bookingsArr
    }


}