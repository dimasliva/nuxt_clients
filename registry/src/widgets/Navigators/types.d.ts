import type { Container } from "inversify";
import type { SelectFormTemplate } from "~forms/WindowDialogs/~sub/SelectForms/SelectFormTemplate";
import type { FinderDataProvider } from "~uilib/FinderDataProviders/FinderDataProvider";


export interface INavRowMetadata {
    isFolder: boolean;
    tag?: any;
    icon?: string;
    getRowActionsMenu?: (internalRowItem: any) => INavRowActionMenuItem[];
}


export interface INavRow {
    $mdata: INavRowMetadata;
    $isSelectable?: boolean;
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
    innerData?: any;
}



export interface INavRowActionMenuItem {
    id: string;
    title: string;
    icon?: string;
    disabled?: boolean;
    action: (internalRowItem: any) => Promise<any>;
}


export interface INavActionMenuItem {
    id: string;
    title: string;
    icon?: string;
    disabled?: boolean;
    action: (path: INavPathItem[], selected: string[]) => Promise<any>;
}


export interface INavigatorContent {
    filterTitle?: string | null;
    columns?: INavColumn[];
    rows: INavRow[];
    visibleCols: string[];
    onVisibleColsChanged?: (visCols: string[]) => void;
    onRowClick?: (level: number, currPathItem: INavPathItem, row: INavRow, index?: number) => Promise<void>;
    onUpdate?: (path: INavPathItem[]) => Promise<void>;
    actionsMenu?: (INavActionMenuItem | ((sel: string[]) => INavActionMenuItem))[];
    pathInfo: INavPathItem,
    finderDataProvider?:  FinderDataProvider;
}


export interface INavigatorProps {
    filterValue?: string | null,
    onNavigate: (currlevel: number, nextlevel: number, currPath: readonly INavPathItem[] | null, row: INavRow | null) => Promise<INavigatorContent>;
    getPathByKey?: (key: string, recCode?: number) => Promise<{ path: INavPathItem[], targetRow: INavRow }>;
}


export interface IСoncreteNavigatorProps {
    diC?: Container | null;
}