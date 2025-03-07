import { injectable } from "inversify";
import { Exception } from "../../Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData } from "./ApiRecord";
import { FilelinkRecord, FilelinkRecordData } from "./FilelinkRecord";
import type { RecordsStore } from "./RecordsStore";


@injectable()
export class ClientSdRecordData extends ApiRecordChData {
    citizenship?: number | null=null;
    kinship?: any | null=null;
    individualId?: string | null=null;
    photo?: string | null=null;
    comments?: string | null=null;
    advData?: any | null=null;
}


@injectable()
export class ClientSdRecord extends ApiRecord<ClientSdRecordData>{

    static override RightToken = "dbClientSd";
    static override RecCode = 1011;
    static override BatchGetRecDataPath="/Clients/GetClientsSd";


    protected _photoFl: FilelinkRecord | null = null;

  
    get RecCode() { return ClientSdRecord.RecCode; }


    protected _createNewData() {
        return   this._RecStore.dataEntityFactory(ClientSdRecordData, null, this.Key);
    }



    protected async _getPhotoFilelink() {
        if (this._photoFl)
            return this._photoFl;

        if (!this.Data!.photo)
            return null;

        return this._photoFl = await this._RecStore.fetch(FilelinkRecord, this.Data!.photo);
    }



    async GetFoto() {
        let pfl = await this._getPhotoFilelink();
        if (!pfl)
            return null;

        return pfl.GetBlob();
    }


    getMPhoto() {
        if (this._photoFl)
            return this._photoFl.MBlob

        return null;
    }



    async setMPhoto(blob: Blob) {
        if (this._photoFl) {
            this._photoFl.MBlob = blob;
            return;
        }

        if (!this.Data!.photo) {
            this._photoFl = await this._RecStore.createNew<FilelinkRecord, FilelinkRecordData>(FilelinkRecord, (data) => { data.title = `#clientPhoto@${this.Key}` });
            this._photoFl.MData.fileType=1;//персональное фото
        }
        else
            await this._getPhotoFilelink()

        if (!this._photoFl)
            Exception.throw("FileLinkCreateErr", "Ошибка создания записи filelink");

        this._photoFl!.MBlob = blob;
    }



    delMPhoto() {
        if (this._photoFl)

            if (!this._photoFl.Key)
                this._photoFl = null;
            else
                this._photoFl.cancelModifingData();

        this.MData!.photo = null;
    }



    async getCurrentPhoto() {
        let pfl = await this._getPhotoFilelink();
        if (!pfl) return null;
        return pfl.getCurrentBlob();
    }



    override cancelModifingData() {
        this._ModifiedData = null;
        if (this._photoFl)
            this._photoFl.cancelModifingData();
    }


    override isDataChanged() {
        if (this._photoFl && this._photoFl.isDataChanged())
            return true;

        return super.isDataChanged();
    }



    override async save() {
        if (this._photoFl) {
            if (!this.Data!.photo) {
                //новое фото
                this._photoFl.MData.client = this.Key;
                await this._photoFl.save();
                this.MData.photo = this._photoFl.Key;
            }
            else
                if (this._photoFl.isDataChanged())
                {
                    await this._photoFl.save();
                    this.MData.photo = this._photoFl.Key;
                }
        }


        if (!super.isDataChanged()) {
            this.cancelModifingData();
            return;
        }

        if (this._isNewData) {
            this._isNewData = false;
            await this._addAllData();
        }
        else {
            await this._updateAllData();
        }

        /*
        if (!this.MData!.photo && this.Data!.photo) {
            //удаление фото
            await this._getPhotoFilelink();
            await this._photoFl?.delete();
            this._photoFl = null;
        }
        */

        this._setModData();
    }



    protected _getApiRecordPathGet = () => "/Clients/GetClientsSd";


    protected _getApiRecordPathAdd = () => "/Clients/SetClientSd";


    protected _getApiRecordPathUpdate = () => "/Clients/SetClientSd";


    protected _getApiRecordPathDelete() { Exception.throw("MethodNotImplemented", "Функция не реализована"); return "" }

}