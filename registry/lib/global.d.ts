declare global {
    interface Class<T=any> {
        /**
         * Returns the name of the function. Function names are read-only and can not be changed.
         */
        new(...args: any[]): T;
        readonly name: string;
    }
}

export {}