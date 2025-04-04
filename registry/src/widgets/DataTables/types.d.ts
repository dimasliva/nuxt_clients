export interface IDataTableProps {
    tableDescr: IDataTableDescription;
    rows: any[];
    selected: TDictViewVal[],
    visibility: Boolean,
    columns: string[],
    selectStrategy?: 'page' | 'single' | 'all',
    titleColName?: string;
}


export interface IDataTableHeadersDescription {
    key: string;
    title: string;
    alignData?: string;
    align?: string;
    width?:string;
    sortable?: boolean;
    requestNames?: string[]
    traits?: { [name: string]: string };
}



export interface IDataTableDescription {
    headers: IDataTableHeadersDescription[]
    actionsMenu?: (item: any) => IMenu[]
}