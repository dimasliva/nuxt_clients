import * as Utils from '~/lib/Utils';

export class QueryParams {
  select: string;
  where?: string;
  orderBy?: string | null;
  limit: number = -1;

  constructor(_select: string, _where: string | undefined, orderBy: string | null = null, _limit = -1) {
    this.select = _select;
    this.where = _where;
    this.limit = _limit;
    this.orderBy = orderBy;
  }
}

export class QueryDictsFFParams {
  dictId: string;
  text: string;
  limit: number;
  section?: number;
  select: string;
  includeObsolete: boolean;

  constructor(_dictId: string, _text: string, _select: string, _limit: number, _includeObsolete: boolean = false, _section?: number) {
    this.dictId = _dictId;
    this.text = _text;
    this.limit = _limit;
    this.select = _select;
    this.includeObsolete = _includeObsolete;
    this.section = _section;
  }
}

export class QueryProductFtsList {
  select: string;
  text: string;
  limit: number;
  minRank: number;
  notActive: boolean;
  productCatalogs: string[];
  temporaryNotActive: boolean;

  constructor(_select: string, _text: string, _limit: number, _minRank: number, _notActive: boolean, _productCatalogs: string[], _temporaryNotActive: boolean) {
    this.select = _select;
    this.text = _text;
    this.limit = _limit;
    this.minRank = _minRank;
    this.notActive = _notActive;
    this.productCatalogs = _productCatalogs;
    this.temporaryNotActive = _temporaryNotActive;
  }
}

export class QueryParamsScheduler {
  fromDate: string;
  toDate: string;
  groupId: string;

  constructor(_fromDate: string, _toDate: string, _groupId: string) {
    this.fromDate = _fromDate;
    this.toDate = _toDate;
    this.groupId = _groupId;
  }
}

export class QuerySchedule {
  begDate: string;
  endDate: string;
  positionIds?: string[] | null;
  divisionIds?: string[] | null;
  placementIds?: string[] | null;
  productIds?: string[] | null;

  constructor(
    _begDate: string | Date,
    _endDate: string | Date,
    _positionIds: string[] | null = null,
    _divisionIds: string[] | null = null,
    _placementIds: string[] | null = null,
    _productIds: string[] | null = null
  ) {
    this.begDate = Utils.getDateStr(new Date(_begDate));
    this.endDate = Utils.getDateStr(new Date(_endDate));
    this.positionIds = _positionIds;
    this.divisionIds = _divisionIds;
    this.placementIds = _placementIds;
    this.productIds = _productIds;
  }
}


export class BookingQuery {
  begDate: string;
  endDate: string;
  positionIds?: string[] | null = null;
  divisionIds?: string[] | null = null;
  placementIds?: string[] | null = null;
  statuses?: number[] | null = null;
  includeNames: boolean = false;
  includePlace: boolean = false;
  includeStatus: boolean = false;

  constructor(
    _begDate: string | Date,
    _endDate: string | Date
  ) {
    this.begDate = Utils.getDateStr(new Date(_begDate));
    this.endDate = Utils.getDateStr(new Date(_endDate));
  }
}


