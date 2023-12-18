
export const enum EMessageType {
    Success,
    Info,
    Warn,
    Error
}


export const enum EDataType {
    "string",
    "int",
    "date",
    "time",
    "strictstring",//строка из определенного набора строк
    "float",
    "text",
    "datetime",
    "strictnum", //число из определенного набора чисел
    "bool" = 10,
    "intarray",
    "strarray",
    "datearray",
    "timearray",
    "any",
    "anyarray",
    "boolarray",
    "floatarray",
    "dtstamp",
    "dtstamparray",
    "strictstringarray", //множественный выбор из ограниченного набора строк
    "phone",
    "email",
    "reference"
}



