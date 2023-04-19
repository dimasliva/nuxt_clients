declare global {
    interface Class<T = any> {
        /**
         * Returns the name of the function. Function names are read-only and can not be changed.
         */
        new(...args: any[]): T;
        readonly name: string;
    }


    interface IEnumerator<T> {
        /**Возвращает следующий элемент(кроме первого вызова-при первом вызове возвращает первый элемент).
          Если достигнут конец возвращает void 0*/
        getNext(): T | undefined;

        /**Возвращает текущий элемент(при первом вызове возвращает первый элемент).
         Если достигнут конец возвращает void 0*/
        getCurrent(): T | undefined;

        /**Возвращает общее количество элементов. Если кол-во не известно возвращает значение  меньше 0*/
        getLength(): number;

        /**Сброс в начало множества */
        reset();

        isError(): boolean; //имеется ошибка. Данные неполные или неверные.  getNext и getCurrent - должны возвращать void 0. Сбрасывается  Reset-ом
    }

    interface IIndexableEnumerator<T> extends IEnumerator<T> {
        getAt(inx: number | string): T;
        setAt(inx: number | string, val: T): boolean;
    }


    interface IKeyValue<TKey, TValue> {
        Key: TKey;
        Value: TValue;
    }

    interface IDictionary<T> {
        getValue(key): any;
        setValue(key, value): boolean;
        updValue(key, value): boolean;
        delValue(key): boolean;
        isKey(key): boolean;
        foreach(func);//если перебор невозможен, то ничего не делает
    }

    interface IMenu {
        id: string;
        title: string;
        icon: string;
        disabled:boolean;
        action: () => string | object | void;
        childs?: IMenu[] | null
    }

    interface IBtnMenu {
        id: string;
        title: string;
        icon: string;
        disabled:boolean;
        color:string;
        bkgColor:string;
        action: () => string | object | void;
    }
}



export { }