
export class QueryParams {
    select: string;
    where: string;
    orderBy?: string|null;
    limit: number = -1;


    constructor(_select: string, _where: string, orderBy:string|null=null, _limit = -1) {
        this.select = _select;
        this.where = _where;
        this.limit = _limit;
        this.orderBy=orderBy;
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


    constructor(_select: string, _text: string, _limit: number, _minRank: number, _notActive: boolean, _productCatalogs: string[], _temporaryNotActive: boolean){
        this.select = _select;
        this.text = _text;
        this.limit = _limit;
        this.minRank = _minRank;
        this.notActive = _notActive;
        this.productCatalogs = _productCatalogs;
        this.temporaryNotActive = _temporaryNotActive;
    }
}
    