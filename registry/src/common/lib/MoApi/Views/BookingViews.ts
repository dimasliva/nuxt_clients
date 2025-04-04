import { injectable, inject } from "inversify";
import { BookingQuery, QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/src/common/lib/UserContext";
import { type IApiDataListResult } from "../RequestResults";
import { DataList } from "~/src/common/lib/DataList";


export interface  IBookingListView {
    id?: string | null;
    begDate?: string | null;
    duration?: number;
    division?: string | null;
    position?: string | null;
    placement?: string | null;
    status?: number;
    product?: string | null;
    productGroup?: string | null;
    client?: string | null;
    clientGroup?: string | null;
    changedAt?: string | null;
    notActive?: boolean | null;
    clientName?: string | null;
    clientSurname?: string | null;
    clientPatronymic?: string | null;
    clientGroupTitle?: string | null;
    productTitle?: string | null;
    productGroupTitle?: string | null;
}



@injectable()
export class BookingsViews {

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getBookings(args: BookingQuery) {
        const apires = await this._MoApiClient.send<BookingQuery, IApiDataListResult>("/Bookings/BookingsListViewPerPeriod", args);
        let res = DataList.createFromApiDl<IBookingListView>(apires);
        return res;
    }


    async getBookingsListView(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/Bookings/BookingsListView", args);
        let res = DataList.createFromApiDl<IBookingListView>(apires);
        return res;
    }

}
