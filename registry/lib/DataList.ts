import { EnumArray } from "./EnumArray";
import { IApiDataListResult } from "./MoApi/RequestResults";


export class DataList<T = any> implements IIndexableEnumerator<T>{

    protected _map: string[] = [];
    protected _indexMap: { [name: string]: number } = {};
    protected _data: any[][] = [];
    protected EnumInx = -1;


    static createFromApiDl<T=any>(apdl:IApiDataListResult){
        var res=new DataList<T>();
        res.setMap(apdl.headers);
        res.setData(apdl.data);
        return res;
    }

    setMap(map: string[]) {
        this._map = map;
        for (let i = 0; i < map.length; i++)
            this._indexMap[map[i]] = i;
    }


    setData(data: string[][]) {
        this._data = data;
    }


    getRow(inx: number | string): T | null {
        var row = this._data[inx];
        if (!row)
            return null;

        let res = <T>{};
        for (let i = 0; i < this._map.length; i++)
            res[this._map[i]] = row[i];

        return res;
    }


    getAt(inx: string | number): T | null {
        return this.getRow(inx);
    }


    setAt(inx: string | number, val: T): boolean {

        if (<number>inx >= this._data.length)
            return false;

        let row = new Array(this._map.length);
        for (let item in val)
            if (this._indexMap[item] != undefined)
                row[this._indexMap[item]] = val[item];
        return true;
    }


    getNext(): T | undefined {
        if (++this.EnumInx >= this.getLength()) {
            this.EnumInx = this.getLength();
            return void 0;
        }
        return <T>this.getRow(this.EnumInx);
    }


    getCurrent(): T | undefined {
        if (this.EnumInx >= this.getLength())
            return void 0;
        if (this.EnumInx < 0) this.EnumInx = 0;
        return <T>this.getRow(this.EnumInx);
    }


    getLength(): number {
        return this._data.length;
    }


    reset() {
        this.EnumInx = -1;
    }


    isError(): boolean {
        return false;
    }


    toArray():EnumArray<T>{
        let res=new EnumArray<T>();
        for(let i=0; i<this._data.length; i++)
          res.push(this.getRow(i)!);
        return res;
    }


}