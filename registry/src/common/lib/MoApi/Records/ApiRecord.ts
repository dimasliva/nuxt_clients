
import { MoApiClient } from "../MoApiClient";
import { CloneData } from "../../Helpers";
import { UserContext } from "../../UserContext";
import type { ICouplingData, IRelData } from "../ApiInterfaces";
import { RecordsCodes } from "./RecordsCodes";
import { Exception } from "../../Exceptions";
import { RecordsStore } from "./RecordsStore";
import { DataEntity } from "./DataEntities/DataEntity";
import { injectable, inject, Container } from "inversify";


@injectable()
export abstract class ApiRecordData extends DataEntity {
  id: eid | null = null;

  constructor(
    @inject("MoApiClient") protected __MoApiClient: MoApiClient,
    @inject("UserContext") protected __UserContext: UserContext,
    @inject("RecordsStore") RecordsStore: RecordsStore
  ) {
    super(RecordsStore);
    Object.defineProperty(this, "__MoApiClient", { enumerable: false });
    Object.defineProperty(this, "__UserContext", { enumerable: false });
  }

  override init(jsonObj: any | null, id: string | null, ...params) {
    super.init(jsonObj);
    this.id = id;
  }
}

export abstract class ApiRecordChData extends ApiRecordData {
  "createdAt"?: string | undefined;
  "changedAt"?: string | undefined;
}

export abstract class ApiRecordCompanyData extends ApiRecordChData {
  "company"?: eid | undefined;
}


@injectable()
export abstract class ApiRecord<T extends ApiRecordChData = ApiRecordChData> {
  public static RightToken = "";
  public static RecCode = 0;
  public static BatchGetRecDataPath = "";
  public static RecordsFindPath = "";


  protected _RecordType: Function = null!;
  public get RecordType(): Function {
    return this._RecordType;
  }
  public set RecordType(value: Function) {
    this._RecordType = value;
  }


  protected _Key: string = null!;
  public get Key(): string {
    return this._Key;
  }
  public set Key(value: string) {
    this._Key = value;
  }


  abstract get RecCode(): number;


  protected _Data: T | null = null;
  public get Data(): T | null {
    if (this._isInvalid)
      Exception.throw("RecIsInvalid", `Запись ${this._Key}  некорректна`);
    return this._Data;
  }


  protected _ModifiedData: T | null = null;
  public get MData(): T {
    return this._ModifiedData ? this._ModifiedData : (this._ModifiedData = <T>new Proxy(this._Data!.clone(), this._getModifingProxyHanlders()));
  }


  protected _isNewData: boolean = true;
  get IsNew() {
    return this._isNewData;
  }


  protected _isInvalid: boolean = false;
  public get IsInvalid() {
    return this._isInvalid;
  }
  public set IsInvalid(value: boolean) {
    this._isInvalid = value;
  }

  protected _isLocked: boolean = false;
  public get isLocked() {
    return this._isLocked;
  }

  protected _pingLockInterval: any = null;

  protected _childsData: { [code: number]: IRelData[] } = {};
  protected _parentsData: { [code: number]: IRelData[] } = {};
  protected _couplingsData: { [code: number]: ICouplingData[] } = {};
  protected _RecStore: RecordsStore = null!;


  constructor(
    @inject("MoApiClient") protected _MoApiClient: MoApiClient,
    @inject("UserContext") protected _UserContext: UserContext,
  ) { }


  init(RecStore: RecordsStore, RecType: Class<ApiRecord>, Key?: string | null) {
    this._RecordType = RecType;
    this._Key = Key!;
    this._RecStore = RecStore;
    return this;
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



  protected _loadDataFromJson(jsonobj: any) {
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
    let res = await this._MoApiClient.send<any, { id: string; changedAt: string }>(this._getApiRecordPathAdd(), this._ModifiedData);
    this._ModifiedData!.id = res.id;
    this._ModifiedData!.changedAt = res.changedAt;
    this._ModifiedData!.createdAt = res.changedAt;
    this.Key = res.id;
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



  loadAllDataFromJson(jsonobj: any) {
    this._loadDataFromJson(jsonobj);
    this._isNewData = false;
  }



  async loadAllData() {
    await this._loadData();
    this._isNewData = false;
    this.IsInvalid = false;
    this._ModifiedData = null;
  }



  async tryLoadAllData() {
    try {
      await this.loadAllData();
      return true;
    } catch { }
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
    } catch { }

    return true;
  }



  async delete() {
    return await this._MoApiClient.send<string, boolean>(this._getApiRecordPathDelete(), this._Key);
  }



  protected async _loadCouplings(slaveRecCode: number) {
    this._couplingsData[slaveRecCode] = await this._MoApiClient.getRelationApiSection().getCouplings(this.Key, this.RecCode, slaveRecCode);
  }



  async getCouplings(slaveRecCode: number) {
    if (slaveRecCode <= 0)
      throw new Exception("ERR", "Неверный код записи");

    if (this._couplingsData[slaveRecCode]) return this._couplingsData[slaveRecCode];

    await this._loadCouplings(slaveRecCode);
    return this._couplingsData[slaveRecCode];
  }



  async addCoupling(slaveKey: string, slaveRecCode: number) {
    if (slaveRecCode <= 0)
      throw new Exception("ERR", "Неверный код записи");

    await this._MoApiClient.getRelationApiSection().addCoupling(this.Key, this.RecCode, slaveKey, slaveRecCode);
    delete this._couplingsData[slaveRecCode];
  }



  async addCouplingByRec(slaveRec: ApiRecord) {
    await this.addCoupling(slaveRec.Key, slaveRec.RecCode);
  }



  async delCoupling(slaveKey: string, slaveRecCode: number) {
    if (slaveRecCode <= 0)
      throw new Exception("ERR", "Неверный код записи");

    await this._MoApiClient.getRelationApiSection().delCoupling(this.Key, this.RecCode, slaveKey, slaveRecCode);
    delete this._couplingsData[slaveRecCode];
  }



  async delCouplingByRec(slaveRec: ApiRecord) {
    await this.delCoupling(slaveRec.Key, slaveRec.RecCode);
  }



  protected async _loadChilds(childsRecCode: number) {
    this._childsData[childsRecCode] = await this._MoApiClient.getRelationApiSection().getChilds(this.Key, this.RecCode, childsRecCode);
  }



  protected async _loadParents(parentsRecCode: number) {
    this._parentsData[parentsRecCode] = await this._MoApiClient.getRelationApiSection().getParents(this.Key, this.RecCode, parentsRecCode);
  }



  async getChilds(childsRecCode: number) {
    if (childsRecCode <= 0)
      throw new Exception("ERR", "Неверный код записи");

    if (this._childsData[childsRecCode]) return this._childsData[childsRecCode];

    await this._loadChilds(childsRecCode);
    return this._childsData[childsRecCode];
  }



  async getParents(parentsRecCode: number = -1) {
    if (parentsRecCode <= 0)
      throw new Exception("ERR", "Неверный код записи");

    if (this._parentsData[parentsRecCode]) return this._parentsData[parentsRecCode];

    await this._loadParents(parentsRecCode);
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
    if (this._isLocked)
      return true;

    this._isLocked = await this._MoApiClient.send<any, boolean>("/Records/LockRecord", { key: this.Key, code: this.RecCode });
    if (this._isLocked) {
      this._pingLockInterval = setInterval(async () => {
        this._isLocked = await this._MoApiClient.send<any, boolean>("/Records/LockRecord", { key: this.Key, code: this.RecCode });
      }, 150 * 1000)
      return this._isLocked;
    }
  }



  /**Разблокировка записи.
   * true-запись разблокирована или не была заблокирована этим пользователем. 
   * false- запись остается заблокированной-вероятно блокировка была наложена другим пользователем
   */
  async unlock() {
    if (this._pingLockInterval) {
      clearInterval(this._pingLockInterval);
      this._pingLockInterval = null;
    }

    if (!this._isLocked)
      return true;

    if (await this._MoApiClient.send<any, boolean>("/Records/UnlockRecord", { key: this.Key, code: this.RecCode })) {
      this._isLocked = false;
      return true;
    }
    return false;
  }
}



export interface ApiRecordClass extends Class {
  RightToken: string;
  RecCode: number;
  BatchGetRecDataPath: string;
  RecordsFindPath: string;
}
