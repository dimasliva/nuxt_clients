export interface IRule {
  (value: string): true | string;
}

export interface IFilterInput {
  type: EInputTypes;
  title: string;
  value: Ref;
  required?: boolean;
  hint?: string;
  rules: IRule[];
  constraints: { min: number; max: number };
}

export interface IPage {
  icon?: string;
  title: string;
  link: string;
  btns: IBtnMenu[];
  filterInput: IFilterInput[];
}
