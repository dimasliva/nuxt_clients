export class EnumArray<T> extends Array<T> implements IIndexableEnumerator<T>
{
    private _EnumInx = -1;

    static factoryFromArr<T>(ar: any[], transfunc?): EnumArray<T> {
        var res = new EnumArray<T>();
        for (var i = 0; i < ar.length; i++) if (!transfunc) res.push(ar[i]); else res.push(transfunc(ar[i]));
        return res;
    }
    static factoryFromObj<T>(srcobj: any, func?): EnumArray<IKeyValue<string, T>> | EnumArray<any> {
        var res = new EnumArray<IKeyValue<string, T>>();
        for (var item in srcobj) {
            var obj = srcobj[item];
            if (typeof obj == "function") continue;
            if (func)
                res.push(func(item, obj));
            else
                res.push({ Key: item, Value: obj });
        }
        return res;
    }

    static factoryFromEnum<T>(src: IEnumerator<any>, transfunc?): EnumArray<T> | null {
        var res = new EnumArray<T>();
        src.reset();
        var item;
        while ((item = src.getNext()) !== void 0) {
            if (transfunc) res.push(transfunc(item));
            else res.push(item);
        }
        if (src.isError()) return null;
        return res;
    }

    getAt = (inx: string | number): T => {
        return this[inx];
    }

    setAt = (inx: string | number, val: T) => {
        this[inx] = val;
        return true;
    }

    getNext = (): T | undefined => {
        if (++this._EnumInx >= this.length) {
            this._EnumInx = this.length;
            return void 0;
        }
        return this[this._EnumInx];
    }
    getCurrent = (): T | undefined => {
        if (this._EnumInx >= this.length) return void 0;
        if (this._EnumInx < 0) this._EnumInx = 0;
        return this[this._EnumInx];
    }

    foreach = (func: (item: T, stop: object | undefined | null) => void) => {
        var stop = { stop: false };
        for (var i = 0; i < this.length; i++) {
            func(this[i], stop);
            if (stop.stop) break;
        }
    }

    getLength = () => this.length;
    reset = () => this._EnumInx = -1;
    isError = () => false;

    toArray() {
        var res: Array<T> = [];
        for (var i = 0; i < this.length; i++) res.push(this[i]);
        return res;
    }
}