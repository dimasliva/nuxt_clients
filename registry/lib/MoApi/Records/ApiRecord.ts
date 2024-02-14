import { MoApiClient } from "../MoApiClient";
import { CloneData } from "../../Helpers";
import { UserContext } from "../../UserContext";
import type { ICouplingData, IRelData } from "../ApiInterfaces";
import { RecordsCodes } from "./RecordsCodes";
import { Exception } from "../../Exceptions";
import { RecordsStore } from "./RecordsStore";
import { DataEntity } from "./DataEntities/DataEntity";
import { DictionaryStore } from "~/lib/Dicts/DictionaryStore";
import { injectable, inject, Container } from "inversify";

<<<<<<< HEAD
=======
@injectable()
>>>>>>> 8c2063822d6ae94448ba24448ee2babb7983ceb6
export abstract class ApiRecordData extends DataEntity {
  id: string | null = null;

  constructor(protected __MoApiClient: MoApiClient, protected __UserContext: UserContext, __RecordStore: RecordsStore) {
    super(__MoApiClient, __UserContext, __RecordStore);
    Object.defineProperty(this, "__MoApiClient", { enumerable: false });
    Object.defineProperty(this, "__UserContext", { enumerable: false });
  }

<<<<<<< HEAD
  override init(id: string | null, jsonObj: any | null) {
    this.id = id;
  }
=======
    constructor(
        @inject("MoApiClient") protected __MoApiClient: MoApiClient,
        @inject("UserContext") protected __UserContext: UserContext,
        @inject("RecordsStore") RecordsStore: RecordsStore) {
        super(RecordsStore);
        Object.defineProperty(this, "__MoApiClient", { enumerable: false });
        Object.defineProperty(this, "__UserContext", { enumerable: false });
    }


    override init(jsonObj: any | null, id: string | null, ...params) {
        super.init(jsonObj)
        this.id = id;
    }
>>>>>>> 8c2063822d6ae94448ba24448ee2babb7983ceb6
}

export abstract class ApiRecordChData extends ApiRecordData {
  "createdAt"?: string | undefined;
  "changedAt"?: string | undefined;
}

export abstract class ApiRecordCompanyData extends ApiRecordChData {
  "company"?: string | undefined;
}

export abstract class ApiRecord<T extends ApiRecordChData = ApiRecordChData> {
  public static RightToken = "";
  public static RecCode = 0;

  protected _RecordType: Function;
  public get RecordType(): Function {
    return this._RecordType;
  }
  public set RecordType(value: Function) {
    this._RecordType = value;
  }

  protected _Key: string;
  public get Key(): string {
    return this._Key;
  }
  public set Key(value: string) {
    this._Key = value;
  }

  abstract get RecCode(): number;

  protected _Data: T | null = null;
  public get Data(): T | null {
    return this._Data;
  }
  //public set Data(value: T | null) { this._Data = value; }

  protected _ModifiedData: T | null = null;
  public get MData(): T {
    return this._ModifiedData ? this._ModifiedData : (this._ModifiedData = <T>new Proxy(this._Data!.clone(), this._getModifingProxyHanlders()));
  }
  //public set MData(value: T | null) { this._ModifiedData = value; }

  protected _isNewData: boolean = true;
  get IsNew() {
    return this._isNewData;
  }

  protected _childsData: { [code: number]: IRelData[] } = {};
  protected _parentsData: { [code: number]: IRelData[] } = {};
  protected _couplingsData: { [code: number]: ICouplingData[] } = {};

  constructor(protected _MoApiClient: MoApiClient, protected _UserContext: UserContext, protected _RecStore: RecordsStore, RecType: Class<ApiRecord>, Key: string) {
    this._RecordType = RecType;
    this._Key = Key;
  }

  protected abstract _getApiRecordPathGet(): string;
  protected abstract _getApiRecordPathAdd(): string;
  protected abstract _getApiRecordPathUpdate(): string;
  protected abstract _getApiRecordPathDelete(): string;
  protected abstract _createNewData(): ApiRecordChData;

  protected _createDataFromLoaded(obj): DataEntity {
    let data = this._createNewData();
    data.fromJsonObj(obj);
    return data;
  }

  protected _createNewAllData(): void {
    this._isNewData = true;
    this._Data = <T>new Proxy(this._createNewData(), this._getProxyHanlders());
  }

  protected _getProxyHanlders(): ProxyHandler<T> {
    return {
      set(target, p, newValue, receiver) {
        return false; //редактирование _Data запрещено из-за общего объекта при асинхронных операциях. Редактирование следует осуществлять через MData
      },
    };
  }

  protected _getModifingProxyHanlders(): ProxyHandler<T> {
    return {};
  }

  protected async _loadData() {
    const arr = await this._MoApiClient.send<string[], any[]>(this._getApiRecordPathGet(), [this._Key]);
    if (!arr[0]) Exception.throw("RecNotFound", `Запись ${this._Key}  не найдена`);
    this._Data = <T>new Proxy(this._createDataFromLoaded(arr[0]), this._getProxyHanlders());
    return this._Data;
  }

  protected async _loadDataFromJson(jsonobj: any) {
    this._Data = <T>new Proxy(this._createDataFromLoaded(jsonobj), this._getProxyHanlders());
    return this._Data;
  }

  protected async _loadOrCreateData() {
    const arr = await this._MoApiClient.send<string[], T[]>(this._getApiRecordPathGet(), [this._Key]);
    if (!arr[0]) return false;

    this._Data = new Proxy(arr[0], this._getProxyHanlders());
    return true;
  }

  protected async _addAllData() {
    if (this.Key) {
      this._ModifiedData!.id = this.Key;
      await this._MoApiClient.send<any, string>(this._getApiRecordPathAdd(), this._ModifiedData);
    } else {
      let guid = await this._MoApiClient.send<any, string>(this._getApiRecordPathAdd(), this._ModifiedData);
      this._ModifiedData!.id = guid;
      this.Key = guid;
    }
    return this.Key;
  }

  protected async _updateAllData() {
    let res = await this._MoApiClient.send<any, { id: string; changedAt: string }>(this._getApiRecordPathUpdate(), this._ModifiedData);
    this.MData.changedAt = res.changedAt;
    return res;
  }

  createAllData(): void {
    this._createNewAllData();
  }

  async loadAllDataFromJson(jsonobj: any) {
    await this._loadDataFromJson(jsonobj);
    this._isNewData = false;
  }

  async loadAllData() {
    await this._loadData();
    this._isNewData = false;
  }

  async tryLoadAllData() {
    try {
      await this.loadAllData();
      return true;
    } catch {}
    return false;
  }

  _setModData() {
    if (this._ModifiedData) this._Data = new Proxy(this._ModifiedData, this._getProxyHanlders());
    this.cancelModifingData();
  }

  cancelModifingData() {
    this._ModifiedData = null;
  }

  isDataChanged() {
    if (!this._ModifiedData) return false;

    return !this._Data!.equal(this._ModifiedData);
  }

  async save() {
    if (!this.isDataChanged()) {
      this.cancelModifingData();
      return;
    }

    if (this._isNewData) {
      this._isNewData = false;
      await this._addAllData();
    } else {
      await this._updateAllData();
    }

    this._setModData();
  }

  async trySave() {
    try {
      await this.save();
      return false;
    } catch {}

    return true;
  }

  async delete() {
    return await this._MoApiClient.send<string, boolean>(this._getApiRecordPathDelete(), this._Key);
  }

  protected async _loadCouplings(slaveRecCode: number = -1) {
    this._couplingsData[slaveRecCode] = await this._MoApiClient.getRelationApiSection().getCouplings(this.Key, this.RecCode, slaveRecCode);
  }

  async getCouplings(slaveRecCode: number = -1) {
    if (this._couplingsData[slaveRecCode]) return this._couplingsData[slaveRecCode];

    this._loadCouplings();
    return this._couplingsData[slaveRecCode];
  }

  async addCoupling(slaveKey: string, slaveRecCode: number) {
    await this._MoApiClient.getRelationApiSection().addCoupling(this.Key, this.RecCode, slaveKey, slaveRecCode);
    delete this._couplingsData[slaveRecCode];
  }

  async addCouplingByRec(slaveRec: ApiRecord) {
    await this.addCoupling(slaveRec.Key, slaveRec.RecCode);
  }

  async delCoupling(slaveKey: string, slaveRecCode: number) {
    await this._MoApiClient.getRelationApiSection().delCoupling(this.Key, this.RecCode, slaveKey, slaveRecCode);
    delete this._couplingsData[slaveRecCode];
  }

  async delCouplingByRec(slaveRec: ApiRecord) {
    await this.delCoupling(slaveRec.Key, slaveRec.RecCode);
  }

  protected async _loadChilds(childsRecCode: number = -1) {
    this._childsData[childsRecCode] = await this._MoApiClient.getRelationApiSection().getChilds(this.Key, this.RecCode, childsRecCode);
  }

  protected async _loadParents(parentsRecCode: number = -1) {
    this._parentsData[parentsRecCode] = await this._MoApiClient.getRelationApiSection().getParents(this.Key, this.RecCode, parentsRecCode);
  }

  async getChilds(childsRecCode: number = -1) {
    if (this._childsData[childsRecCode]) return this._childsData[childsRecCode];

    this._loadChilds();
    return this._childsData[childsRecCode];
  }

  async getParents(parentsRecCode: number = -1) {
    if (this._parentsData[parentsRecCode]) return this._parentsData[parentsRecCode];

    this._loadParents();
    return this._parentsData[parentsRecCode];
  }

  async addChild(childId: string, childRecCode: number, relType: number) {
    await this._MoApiClient.getRelationApiSection().addChild(this.Key, this.RecCode, childId, childRecCode, relType);
    delete this._childsData[childRecCode];
  }

  async addChildByRec(childRec: ApiRecord, relType: number) {
    await this.addChild(childRec.Key, childRec.RecCode, relType);
  }

  async delChild(childId: string, childRecCode: number) {
    await this._MoApiClient.getRelationApiSection().delChild(this.Key, this.RecCode, childId, childRecCode);
    delete this._childsData[childRecCode];
  }

  async delChildByRec(childRec: ApiRecord) {
    await this.delChild(childRec.Key, childRec.RecCode);
  }

  async updateRelation(childId: string, childRecCode: number, relType: number) {
    await this._MoApiClient.getRelationApiSection().updateRelation(this.Key, this.RecCode, childId, childRecCode, relType);
    delete this._childsData[childRecCode];
  }

  async updateRelationByRec(childRec: ApiRecord, relType: number) {
    await this.updateRelation(childRec.Key, childRec.RecCode, relType);
  }

  async lock() {
    return await this._MoApiClient.send<any, boolean>("/Records/LockRecord", { key: this.Key, code: this.RecCode });
  }

  async unlock() {
    return await this._MoApiClient.send<any, boolean>("/Records/UnlockRecord", { key: this.Key, code: this.RecCode });
  }
}

export interface ApiRecordClass extends Class {
  rightToken: string;
}
