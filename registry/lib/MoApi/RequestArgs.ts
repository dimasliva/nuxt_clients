
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