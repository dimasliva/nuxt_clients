export interface IRule {
  (value: string): true | string;
}
export enum EFilterInputValueKey {
  fio = "fio",
  birthdate = "birthdate",
  mainEmail = "mainEmail",
  mainPhone = "mainPhone",
  snils = "snils",
}
export interface IFilterInputValue {
  value: string;
  key: EFilterInputValueKey;
}

export interface IFilterInput {
  type: EInputTypes;
  title: string;
  input: IFilterInputValue;
  required?: boolean;
  hint?: string;
  rules: IRule[];
  constraints: { min: number; max: number };
}

export interface IPage {
  icon?: string;
  title: string;
  link: string;
  onFilter: (inputs: IFilterInputValue[]) => void;
  btns: IBtnMenu[];
  filterInput: IFilterInput[];
}
