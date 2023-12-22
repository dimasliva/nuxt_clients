import { injectable, inject, optional } from "inversify";
import type { UserContext } from "~/lib/UserContext";


interface IFreqUsingStringStatisticOptions {
    instName: string,
    strsLimit: number;
}


@injectable()
export class FreqUsingStringStatistic {

    protected _keyPref: string = null!;
    protected _instName: string = null!
    protected _strsLimit: number = 100
    protected _storage: { v: string, t: number }[] = [];


    constructor(
        @inject("UserContext") protected _UserContext: UserContext,
        @inject("IFreqUsingStringStatisticOptions") @optional() _options: IFreqUsingStringStatisticOptions
    ) {
        if (_options)
            this.init(_options.instName, _options.strsLimit);
    }



    init(instName: string, strsLimit = 100) {
        if (!this._instName) {
            this._instName = instName;
            this._strsLimit = strsLimit;
            this._keyPref = `FreqUsingStringStatistic_${this._instName}_${this._UserContext.AuthorityData?.userId}`;

            let stor = localStorage.getItem(this._keyPref);
            this._storage = stor ? JSON.parse(stor) : [];
        }
    }



    getMostFreq(limit = 20) {
        const map: { [str: string]: number } = {};
        this._storage.forEach((item) => {
            map[item.v] ? map[item.v]++ : map[item.v] = 1;
        });
        debugger;
        var res = Object.keys(map).sort((k1, k2) => map[k1] - map[k2]);
        return res.slice(0, limit);
    }



    addItem(val: string) {
        if (this._storage.length < this._strsLimit)
            this._storage.push({ v: val, t: Date.now() });
        else {
            let minVal = this._storage[0].t, minInx = 0;

            this._storage.forEach((item, inx) => {
                if (item.t < minVal) {
                    minVal = item.t;
                    minInx = inx;
                }
            });
            this._storage[minInx] = { v: val, t: Date.now() }
        }
    }



    clear() {
        this._storage = [];
        localStorage.removeItem(this._keyPref);
    }



    protected _save() {
        localStorage.setItem(this._keyPref, JSON.stringify(this._storage));
    }

}