
export class QueryParams {
    select: string;
    where: string;
    limit: number = -1;

    
    constructor(_select: string, _where: string, _limit = -1) {
        this.select = _select;
        this.where = _where;
        this.limit = _limit;
    }
}