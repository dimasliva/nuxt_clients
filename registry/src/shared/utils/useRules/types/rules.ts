export interface INumberRules {
  required: (value: any) => string | boolean;
  isNumber: (value: any) => string | boolean;
  min: (value: any, min: number) => string | boolean;
  max: (value: any, max: number) => string | boolean;
  equal: (value: any, equal: number) => string | boolean;
}

export interface ITextRules {
  required: (value: any) => string | boolean;
  min: (value: any, min: number) => string | boolean;
  max: (value: any, max: number) => string | boolean;
}
