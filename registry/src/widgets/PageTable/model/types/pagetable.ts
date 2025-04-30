export type TSelectStrategy = "single" | "page" | "all";
export type TAlign = "start" | "end" | "center";

export interface ITableColumn extends ITableHeaderColumn {
  align: TAlign;
  width: string;
}
export interface ITableHeaderColumn {
  key: string;
  sortable: boolean;
  title: string;
  selected?: boolean;
}

export interface ITableRow {
  id: string;
  fio?: string;
  birthdate?: string;
  gender? : string;
  mainPhone? : string;
  mainEmail? : string;
  snils? : string;
}

export interface ISeletedRow{
  value: string;
  title: string;
}

interface ITableMenu {
  id: string;
  title: string;
  icon: string;
  disabled: boolean;
  action: (item: ITableRow) => string | object | void;
  childs?: ITableMenu[] | null;
  traits?: { [rec: string]: string } | null;
}

export interface IOpenTableRow {
  raw: { [key: string]: any };
  columns: { [key: string]: any };
  selected: boolean;
  type: string;
  value: string;
  index: string;
}
export interface ITableDescription {
  headers: ITableColumn[];
  actionsMenu?: () => ITableMenu[];
}

export type IRowSelected = { value: any; title: string };

export interface IPageTableProps {
  allColumns: ITableColumn[];
  columns: ITableColumn[];
  rows: ITableRow[];
  tableDescr: ITableDescription;
  selectedTitleCol: string;
  notFoundRow?: string;
}
export interface ITableHeader {
  [key: string]: {
    title: string;
    sortable: boolean;
    align: TAlign;
    width: string;
  };
}
export interface ITable {
  columns: ITableColumn[],
  rows: ITableRow[],
}