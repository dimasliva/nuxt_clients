import { Exception } from "../../Exceptions";
import { UserContext } from "../../UserContext";
import { MoApiClient } from "../MoApiClient";
import { ApiRecord, IApiRecordChData } from "./ApiRecord";



export interface IFilelinkRecordData extends IApiRecordChData {
    position?: string;
    createDate?: string;
    title: string;
    uid?: string | null;
    client?: string | null;
    path?: string | null;
    ext?: string | null;
    size: number;
    hash: string;
    docType?: number | null;
    fileType?: number | null;
    group?: string | null;
    fileCollection?: string | null;
    removeAfter?: string | null;
    notActive?: boolean | null;
    advData?: any | null;
}


export class FilelinkRecord extends ApiRecord<IFilelinkRecordData>{

    static rightToken = "dbFilelink";

    protected _blob: Blob | null = null;
    protected _mfile: File | null = null;

    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, Key: string) {
        super(_MoApiClient, __UserContext, FilelinkRecord, Key);
    }


    protected _createNewData() {
        return {
            id: this.Key,
            title: ""
        };
    }


    protected async _downloadFile() {
        let blob = await this._MoApiClient.downloadFile("/Files/DownloadFile", { filelinkId: this.Key });
        return blob;
    }


    cancelModifingData() {
        this._ModifiedData = null;
        this._mfile = null;
    }



    setModData() {
        if (this._ModifiedData)
            this._Data = new Proxy(this._ModifiedData, this._getProxyHanlders());

        if (this._mfile)
            this._blob = this._mfile;

        this.cancelModifingData();
    }


    isDataChanged() {
        if (this._mfile)
            return true;
        return super.isDataChanged()
    }


    async save() {
        if (!this.isDataChanged()) {
            this.cancelModifingData();
            return;
        }

        const datamodifed = super.isDataChanged();

        if (this._mfile) {

            let args: any = {
                File: this._mfile
            };

            if (this.Key)
                args.FilelinkId = this.Key

            let nf = await this._MoApiClient.sendMultipart("/Files/UploadFile", args) as IFilelinkRecordData;
            if (this._isNewData) {
                this._isNewData = false;
                this.MData.id = nf.id;
                this.Key = nf.id;
            }

            for (let item in nf)
                if (this.MData[item] === void 0 && nf[item] !== void 0)
                    this.MData[item] = nf[item];
        }


        if (datamodifed) {
            await this._updateAllData();
        }

        this._setModData();
    }


    async GetBlob() {
        if (!this._blob)
            this._blob = await this._downloadFile();

        return this._blob;
    }



    async SetFile(blob: File) {
        this._mfile = blob;
    }


    protected _getApiRecordPathGet = () => "/Files/GetFilelinks";


    protected _getApiRecordPathAdd = () => { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }


    protected _getApiRecordPathUpdate = () => "/Files/UpdateFilelink";


    protected _getApiRecordPathDelete = () => "/Files/DeleteFilelink";

}