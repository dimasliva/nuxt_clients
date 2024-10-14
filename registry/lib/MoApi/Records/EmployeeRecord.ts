import { Exception } from "~/lib/Exceptions";
import type { UserContext } from "../../UserContext";
import type { MoApiClient } from "../MoApiClient";
import { ApiRecord, ApiRecordChData, } from "./ApiRecord";
import { FilelinkRecord, FilelinkRecordData } from "./FilelinkRecord";
import type { RecordsStore } from "./RecordsStore";
import { injectable } from "inversify";

@injectable()
export class EmployeeRecordData extends ApiRecordChData {
    name: string = "";
    surname: string = "";
    patronymic?: string | null = null;
    gender: string = "u";
    birthdate?: string | null = null;
    rank?: number | null = null;
    photo?: string | null = null;
    roles?: string | null = null;
    notActive?: boolean | null = null;
    linkedRecs?: any | null = null;
    profile?: any | null = null;
    advData?: any | null = null;
}



export enum EEmployeeAccountStatus {
    NotPresent = 0,
    isActive,
    isNotActive
}


@injectable()
export class EmployeeRecord extends ApiRecord<EmployeeRecordData>{

    static override RightToken = "dbEmployee";
    static override RecCode = 1004;
    static override BatchGetRecDataPath="/Employees/GetEmployees";


    protected _photoFl: FilelinkRecord | null = null;

    
    get RecCode() { return EmployeeRecord.RecCode; }



    protected _createNewData() {
        return this._RecStore.dataEntityFactory(EmployeeRecordData, null, this.Key);
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
            this._photoFl = await this._RecStore.createNew<FilelinkRecord, FilelinkRecordData>(FilelinkRecord, (data) => { data.title = `#employeePhoto@${this.Key}` });
            this._photoFl.MData.fileType = 1;//персональное фото// FileTypes
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
                await this._photoFl.save();
                this.MData.photo = this._photoFl.Key;
            }
            else
                if (this._photoFl.isDataChanged()) {
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

        this._setModData();
    }



    async setAccountActivity(active: boolean) {
        return await this._MoApiClient.send("/Employees/setEmployeeAccountActivity", { id: this.Key, isActive: active });
    }



    async createEmployeeAccount(login: string) {
        return await this._MoApiClient.send("/Employees/CreateEmployeeAccount", { login, EmployeeId: this.Key, Email: login });
    }

    

    async deleteEmployeeAccount() {
        return await this._MoApiClient.send("/Employees/DeleteEmployeeAccount", this.Key);
    }


    async isAccountPresent(login: string) {
        return await this._MoApiClient.send("/Employees/IsAccountPresent", login);
    }



    async getStatusEmployeeAccount() {
        return await this._MoApiClient.send<string, EEmployeeAccountStatus>("/Employees/GetStatusEmployeeAccount", this.Key);
    }


    protected _getApiRecordPathGet = () => "/Employees/GetEmployees";


    protected _getApiRecordPathAdd = () => "/Employees/AddEmployee";


    protected _getApiRecordPathUpdate = () => "/Employees/UpdateEmployee";


    protected _getApiRecordPathDelete = () => "/Employees/DeleteEmployee";

}