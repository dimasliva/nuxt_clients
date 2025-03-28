
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import { injectable, inject } from "inversify";
import { ProductGroupRecord, type ProductGroupRecordData } from "./ProductGroupRecord";
import { Exception } from "~/lib/Exceptions";
import { ClientGroupRecord, ClientGroupRecordData } from "./ClientGroupRecord";


@injectable()
export class BookingRecordData extends ApiRecordChData {
  specialty: number | null = null;
  position: string | null = null;
  organization: string | null = null;
  division: string | null = null;
  placement: string | null = null;
  beginDate: string = "";
  duration: number = 0;
  client: string | null = null;
  clientGroup: string | null = null;
  product: string | null = null;
  productGroup: string | null = null;
  status: number = 0;
  paymentStatus: number | null = null;
  failureCause: number | null = null;
  comments: string | null = null;
  notActive: boolean | null = null;
}


@injectable()

export class BookingRecord extends ApiRecord<BookingRecordData> {
  static override RightToken = "dbBooking";
  static override RecCode = 1028;
  static override BatchGetRecDataPath = "/Bookings/GetBookings";
  static override RecordsFindPath = "/Bookings/FindBookings";

  protected _newProductGroupPending: ProductGroupRecordData | undefined | null = null;
  protected _newClientGroupPending: ClientGroupRecordData | undefined | null = null;

  

  get RecCode() {
    return BookingRecord.RecCode;
  }

  protected _createNewData() {
    return this._RecStore.dataEntityFactory(BookingRecordData, null, this.Key);
  }





  protected _getApiRecordPathGet = () => "/Bookings/GetBookings";

  protected _getApiRecordPathAdd = () => "/Bookings/AddBooking";

  protected _getApiRecordPathUpdate = () => "/Bookings/UpdateBooking";

  protected _getApiRecordPathDelete = () => "/Bookings/DeleteBooking";



  setNewProductGroup(pgd: ProductGroupRecordData) {
    this._newProductGroupPending = pgd;
  }



  setNewClientGroup(cgd: ClientGroupRecordData) {
    this._newClientGroupPending = cgd;
  }



  override isDataChanged() {
    return super.isDataChanged() || this._newProductGroupPending ? true : false;
  }



  protected override async _addAllData() {

    if (this._newProductGroupPending || this._newClientGroupPending) {

      if (this._newProductGroupPending && (this.MData.product || this.MData.productGroup))
        Exception.throw("Err", `Нельзя создать новую группу продуктов, если группа или продукт уже заданы`);

      if (this._newClientGroupPending && (this.MData.client || this.MData.clientGroup))
        Exception.throw("Err", `Нельзя создать новую группу клиентов, если группа или клиент уже заданы`);

      let inx = 1;
      let grprInx = 0;
      let clgrInx = 0;

      const sendobj = [
        {
          code: BookingRecord.RecCode,
          entity: this._ModifiedData as any
        }];

      if (this._newProductGroupPending) {
        sendobj.push({
          code: ProductGroupRecord.RecCode,
          entity: this._newProductGroupPending
        });
        grprInx = inx++;
      }

      if (this._newClientGroupPending) {
        sendobj.push({
          code: ClientGroupRecord.RecCode,
          entity: this._newClientGroupPending
        });
        clgrInx = inx++;
      }

      let res = await this._MoApiClient.send<any, { id: string; changedAt: string }[]>("/records/AddRecs", sendobj);
      this.Key = res[0].id;
      this._ModifiedData!.id = this.Key;
      this._ModifiedData!.changedAt = res[0].changedAt;
      this._ModifiedData!.createdAt = res[0].changedAt;

      if (grprInx) this._ModifiedData!.productGroup = res[grprInx].id;
      if (clgrInx) this._ModifiedData!.clientGroup = res[clgrInx].id;

      super._updateAllData();
      this._newProductGroupPending = null;
      this._newClientGroupPending = null;
    }
    else
      await super._addAllData()

    return this.Key;
  }

}
