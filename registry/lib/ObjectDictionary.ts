import  { EnumArray } from "./EnumArray";


const protectedItems = {
    isKey: true,
    delValue: true,
    getValue: true,
    setValue: true,
    updValue: true,
    foreach: true,
    toEnumArray: true
}

export class ObjectDictionary<T> extends Object implements IDictionary<T> {


    isKey(key) {
        return (protectedItems[key] || this[key] === void 0) ? false : true;
    }

    delValue(key: any) {
        if (!protectedItems[key]) {
            delete this[key];
            return true;
        }
        else
            return false;
    }

    getValue(key): any {
        return protectedItems[key] ? void 0 : this[key];
    }

    setValue(key, value) {
        if (!protectedItems[key]) {
            this[key] = value;
            return true;
        }
        else
            return false;
    }

    updValue(key, value) {
        if (!protectedItems[key]) {
            if (typeof value == "object") {
                if (!this[key]) this[key] = {};
                if (typeof this[key] == "object")
                    for (var item in value) {
                        this[key][item] = value[item];
                    }
            }
            return true;
        }
        else return false;
    }

    foreach(func) {
        var stop = { stop: false };
        for (let item in this) {
            if (!protectedItems[<string>item]) continue;
            func(item, this[item], stop);
            if (stop.stop) break;
        }
    }

    toEnumArray(func?): EnumArray<IKeyValue<string, T>> | EnumArray<any> {
        let res=new EnumArray();
        for (let item in this) {
            if (!protectedItems[<string>item]) continue;
            let obj=this[item];
            if (func)
                res.push(func(item, obj));
            else
                res.push({ Key: item, Value: obj });
        }
        return res;
    }
}