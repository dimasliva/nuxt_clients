
import { MoApiClient } from "../MoApiClient";
import { CloneData } from "../../Helpers";
import { UserContext } from "~~/lib/UserContext";


export abstract class ApiRecord<T = any>{

    protected _RecordType: Function;
    public get RecordType(): Function { return this._RecordType; }
    public set RecordType(value: Function) { this._RecordType = value; }

    protected _Key: string;
    public get Key(): string { return this._Key; }
    public set Key(value: string) { this._Key = value; }

    protected _Data: T | null = null;
    public get Data(): T | null { return this._Data; }
    public set Data(value: T | null) { this._Data = value; }

    protected _prevData: T | null = null;
    protected _isNewData: boolean = true;


    constructor(protected _MoApiClient: MoApiClient, protected __UserContext: UserContext, RecType: typeof ApiRecord<any>, Key: string) {
        this._RecordType = RecType;
        this._Key = Key;
    }

    protected abstract _getApiRecordPathGet(): string;
    protected abstract _getApiRecordPathAdd(): string;
    protected abstract _getApiRecordPathUpdate(): string;
    protected abstract _getApiRecordPathDelete(): string;
    protected abstract _createNewAllData(): void;


    protected _setPrev(): void {
        this._prevData = CloneData(this._Data);
    }


    protected async _loadAData() {
        const arr = await this._MoApiClient.send<string[], T[]>(this._getApiRecordPathGet(), [this._Key]);
        this._Data = arr[0];
        return this._Data;
    }


    protected async _addAllData() {
        return this._MoApiClient.send<any, boolean>(this._getApiRecordPathAdd(), this._Data);
    }


    protected async _updateAllData() {
        return this._MoApiClient.send<any, boolean>(this._getApiRecordPathUpdate(), this._Data);
    }


    createAllData(): void {
        this._createNewAllData();
        this._setPrev();
    }


    async loadAllData() {
        await this._loadAData();
        this._isNewData = false;
        this._setPrev();
    }


    async tryLoadAllData() {
        try {
            await this.loadAllData();
            return true;
        }
        catch { };
        return false;
    }


    isDataChanged() {
        return JSON.stringify(this._Data) === JSON.stringify(this._Data);
    }


    async save() {
        if (!this.isDataChanged)
            return;

        if (this._isNewData) {
            this._isNewData = false;
            await this._addAllData();
        }
        else {
            await this._updateAllData();
        }

        this._setPrev();
    }


    async trySave() {
        try {
            await this.save();
            return false;
        }
        catch { };

        return true;
    }


    async delete() {
        return this._MoApiClient.send<string, boolean>(this._getApiRecordPathDelete(), this._Key);
    }

}


