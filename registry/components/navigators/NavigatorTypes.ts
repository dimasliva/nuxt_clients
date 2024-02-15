import type { Container } from "inversify";


export interface INavRowMetadata {
    isFolder: boolean,
    tag?: any,
    icon?: string,
    getRowActionsMenu?: (internalRowItem: any) => INavRowActionMenuItem[]
}


export type TNavRow = {
    $mdata: INavRowMetadata,
    id: string,
    titlte: string
} & { [colname: string]: string };



export interface INavColumn {
    key: string,
    title: string,
    align?: "center" | "end" | "start" | undefined,
    alignData?: "center" | "end" | "start" | undefined,
    width?: string | number | undefined,
    minWidth?: string | undefined,
    sortable?: boolean,
    cellProps?: { [propsName: string]: any } | undefined;
}



export interface INavPathItem {
    key: string,
    title: string,
    tag?: any
}



export interface INavRowActionMenuItem {
    id: string,
    title: string,
    icon?: string,
    disabled?: boolean,
    action: (internalRowItem: any) => Promise<any>
}



export interface INavigatorContent {
    columns?: INavColumn[]
    rows: TNavRow[],
    visibleCols?: string[];
    onRowClick?: (level: number, currPathItem: INavPathItem, row: TNavRow) => Promise<void>,
    actionsMenu?: INavRowActionMenuItem[],
    pathInfo: INavPathItem
}


export interface INavigatorProps {
    onNavigate: (currlevel: number, nextlevel: number, currPath: readonly INavPathItem[] | null, row: TNavRow | null) => Promise<INavigatorContent>,
}


export interface IСoncreteNavigatorProps {
    diC?: Container | null;
}