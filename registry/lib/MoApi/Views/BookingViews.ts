import { injectable, inject } from "inversify";
import { BookingQuery, QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/lib/UserContext";
import { type IApiDataListResult } from "../RequestResults";
import { DataList } from "~/lib/DataList";


export interface  IBookingListView {
    id?: string | null;
    begDate?: string | null;
    duration?: number;
    division?: string | null;
    position?: number | null;
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

    constructor(@inject("MoApiBooking") protected _MoApiBooking: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getBookings(args: BookingQuery) {
        const apires = await this._MoApiBooking.send<BookingQuery, IApiDataListResult>("/Schedule/GetBookings", args);
        let res = DataList.createFromApiDl<IBookingListView>(apires);
        return res;
    }


    async getBookingsListView(args: QueryParams) {
        const apires = await this._MoApiBooking.send<QueryParams, IApiDataListResult>("/Schedule/BookingsListView", args);
        let res = DataList.createFromApiDl<IBookingListView>(apires);
        return res;
    }

}
