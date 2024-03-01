import { injectable } from "inversify";
import { Exception } from "../../Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import type { RecordsStore } from "./RecordsStore";


@injectable()
export class FilelinkRecordData extends ApiRecordChData {
    position?: string;
    createDate?: string;
    title: string = "";
    uid?: string | null;
    client?: string | null;
    path?: string | null;
    ext?: string | null;
    size: number = null!;
    hash: string = null!;
    docType?: number | null;
    fileType?: number | null;
    group?: string | null;
    fileCollection?: string | null;
    removeAfter?: string | null;
    notActive?: boolean | null;
    advData?: any | null;
}

@injectable()
export class FilelinkRecord extends ApiRecord<FilelinkRecordData>{

    static RightToken = "dbFilelink";
    static RecCode = 1019;
    static BatchGetRecDataPath="/Files/GetFilelinks";

    protected _blob: Blob | null = null;

    protected _mblob: Blob | null = null;
    get MBlob(): Blob | null { return this._mblob; }
    set MBlob(file: Blob) { this._mblob = file }


    get RecCode() { return FilelinkRecord.RecCode; }


    protected _createNewData() {
        return this._RecStore.dataEntityFactory(FilelinkRecordData, null, this.Key);
    }


    protected async _downloadFile() {
        let blob = await this._MoApiClient.downloadFile("/Files/DownloadFile", { filelinkId: this.Key });
        return blob;
    }


    cancelModifingData() {
        this._ModifiedData = null;
        this._mblob = null;
    }



    setModData() {
        if (this._ModifiedData)
            this._Data = new Proxy(this._ModifiedData, this._getProxyHanlders());

        if (this._mblob)
            this._blob = this._mblob;

        this.cancelModifingData();
    }


    async getCurrentBlob() {
        if (this.isDataChanged())
            return this._mblob;

        return await this.GetBlob();
    }


    isDataChanged() {
        if (this._mblob)
            return true;
        return super.isDataChanged()
    }


    async save() {
        if (!this.isDataChanged()) {
            this.cancelModifingData();
            return;
        }

        const datamodifed = super.isDataChanged();

        if (this._mblob) {

            let args: any = {
                filetype: this.MData.fileType,
                File: this._mblob
            };

            if (this.Key)
                args.FilelinkId = this.Key

            let nf = await this._MoApiClient.sendMultipart("/Files/UploadFile", args) as FilelinkRecordData;
            if (this._isNewData) {
                this._isNewData = false;
                this.MData.id = nf.id;
                this.Key = nf.id!;
            }

            for (let item in nf)
                if (this.MData[item] === void 0 && nf[item] !== void 0)
                    this.MData[item] = nf[item];
            this.MData.changedAt = nf.changedAt;
            this.MData.size = nf.size;
            this.MData.hash = nf.hash;
        }


        if (datamodifed) {
            await this._updateAllData();
        }

        this._setModData();
    }


    async GetBlob() {
        if (this._isNewData)
            return null;

        if (!this._blob)
            this._blob = await this._downloadFile();

        return this._blob;
    }



    protected _getApiRecordPathGet = () => "/Files/GetFilelinks";


    protected _getApiRecordPathAdd = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathUpdate = () => "/Files/UpdateFilelink";


    protected _getApiRecordPathDelete = () => "/Files/DeleteFilelink";

}