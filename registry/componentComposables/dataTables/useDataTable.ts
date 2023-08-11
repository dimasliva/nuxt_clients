import * as Utils from '~~/lib/Utils';

export interface IDataTableHeadersDescription {
    key: string;
    title: string;
    align?: string;
    sortable?: boolean;
    requestNames?: string[]
    traits?: { [name: string]: string };
}

export interface IDataTableDescription {
    headers: IDataTableHeadersDescription[]
    actionsMenu?: (item: any) => IMenu[]
}


