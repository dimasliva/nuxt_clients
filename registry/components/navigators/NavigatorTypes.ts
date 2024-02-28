import type { Container } from "inversify";


export interface INavRowMetadata {
    isFolder: boolean;
    tag?: any;
    icon?: string;
    getRowActionsMenu?: (internalRowItem: any) => INavRowActionMenuItem[];
}


export interface INavRow {
    $mdata: INavRowMetadata;
    id: string;
    title: string;
};



export interface INavColumn {
    key: string;
    title: string;
    align?: "center" | "end" | "start" | undefined;
    alignData?: "center" | "end" | "start" | undefined;
    width?: string | number | undefined;
    minWidth?: string | undefined;
    sortable?: boolean;
    cellProps?: { [propsName: string]: any } | undefined;
}



export interface INavPathItem {
    key: string;
    title: string;
    tag?: any;
}



export interface INavRowActionMenuItem {
    id: string;
    title: string;
    icon?: string;
    disabled?: boolean;
    action: (internalRowItem: any) => Promise<any>;
}



export interface INavigatorContent {
    filterTitle?: string | null;
    columns?: INavColumn[];
    rows: INavRow[];
    visibleCols?: string[];
    onRowClick?: (level: number, currPathItem: INavPathItem, row: INavRow) => Promise<void>;
    actionsMenu?: INavRowActionMenuItem[];
    pathInfo: INavPathItem;
}


export interface INavigatorProps {
    filterValue?: string | null,
    onNavigate: (currlevel: number, nextlevel: number, currPath: readonly INavPathItem[] | null, row: INavRow | null) => Promise<INavigatorContent>;
}


export interface IСoncreteNavigatorProps {
    diC?: Container | null;
}