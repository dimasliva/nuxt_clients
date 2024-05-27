
import { injectable, inject, Container } from "inversify";
import { RecordsApiSection } from "./ApiSectionsV1/RecordsApiSection";
import { Exception } from "../Exceptions";


@injectable()
export class ApiLock {

    protected _lockId: string = "";
    protected _isCaptured = false;


    constructor(
        @inject(RecordsApiSection) protected _RecordsApiSection: RecordsApiSection
    ) { }


    init(lockId: string) {
        this._lockId = lockId;
    }



    isСaptured() {
        return this._isCaptured;
    }


    async waitLock(timeout: number) {
        this._isCaptured = await this._RecordsApiSection.getLock(this._lockId);
        if (this._isCaptured)
            return true;

        let stop = false;
        setTimeout(() => stop = true, timeout);

        const check = async (res) => {
            this._isCaptured = await this._RecordsApiSection.getLock(this._lockId);

            if (this._isCaptured) {
                res(true);
                return;
            }

            if (stop) {
                res(false);
                return;
            }

            setTimeout(()=>check(res), Math.random() * 1200 + 300);
        }


        const task = new Promise<boolean>((res) => {
            check(res);
        })

        return await task;
    }



    async unlock() {
        if (this._isCaptured)
            this._isCaptured = !await this._RecordsApiSection.unlock(this._lockId);
    }



    async execWithLock(timeout: number, func: () => any) {
        const lock = await this.waitLock(timeout);
        if (!lock)
            throw new Exception("lockErr", "Не удалось получить блокировку");
        try {
            var res = await func();
        }
        finally {
            await this.unlock();
        }
        return res;
    }
}
