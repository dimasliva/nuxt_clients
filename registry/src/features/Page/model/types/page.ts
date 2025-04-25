export enum EInputTypes {
  text = "text",
  number = "number",
  email = "email",
  phone = "phone",
  date = "date",
}

export interface IErrorMessages {
  [key: string]: string;
}


export interface IFilterInput {
  type: EInputTypes;
  title: string;
  hint?: string;
  rules: ((value: string) => true | string)[]; 
  value: Ref;
  required?: boolean;
  constraints: {
    min?: number;
    max?: number;
  };
}

export interface IPage {
  icon?: string;
  title: string;
  link: string;
  btns: IBtnMenu[];
  filterInput: IFilterInput[];
}
export interface IPinPage { 
  icon?: string, 
  title: string, 
  link: string
}