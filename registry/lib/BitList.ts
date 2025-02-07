//Author DeepSeek-V3

export class BitList {
    private bitArray: number[];

    /**
     * Инициализирует новый экземпляр класса FeatureAccess с указанным количеством битов.
     * @param size Количество битов в массиве.
     */
    constructor(size: number) {
        this.bitArray = new Array(Math.ceil(size / 32)).fill(0); // Каждое число хранит 32 бита
    }

    /**
     * Получает или устанавливает значение бита по указанному индексу.
     * @param index Индекс бита.
     * @returns Значение бита (true или false).
     */
    public getBit(index: number): boolean {
        const arrayIndex = Math.floor(index / 32);
        const bitIndex = index % 32;
        return ((this.bitArray[arrayIndex] >> bitIndex) & 1) === 1;
    }

    /**
     * Устанавливает значение бита по указанному индексу.
     * @param index Индекс бита.
     * @param value Значение бита (true или false).
     */
    public setBit(index: number, value: boolean): void {
        const arrayIndex = Math.floor(index / 32);
        const bitIndex = index % 32;
        if (value) {
            this.bitArray[arrayIndex] |= (1 << bitIndex); // Устанавливаем бит в 1
        } else {
            this.bitArray[arrayIndex] &= ~(1 << bitIndex); // Устанавливаем бит в 0
        }
    }

    /**
     * Включает бит по указанному индексу.
     * @param index Индекс бита.
     */
    public enableBit(index: number): void {
        this.setBit(index, true);
    }

    /**
     * Выключает бит по указанному индексу.
     * @param index Индекс бита.
     */
    public disableBit(index: number): void {
        this.setBit(index, false);
    }

    /**
     * Конвертирует битовый массив в строку в формате base64.
     * @returns Строка в формате base64.
     */
    public toBase64(): string {
        const bytes = new Uint8Array(this.bitArray.length * 4);
        const dataView = new DataView(bytes.buffer);
        for (let i = 0; i < this.bitArray.length; i++) {
            dataView.setUint32(i * 4, this.bitArray[i], true); // Little-endian
        }
        return btoa(String.fromCharCode(...bytes));
    }

    /**
     * Инициализирует битовый массив из строки в формате base64.
     * @param base64 Строка в формате base64.
     */
    public fromBase64(base64: string): BitList {
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const dataView = new DataView(bytes.buffer);
        this.bitArray = [];
        for (let i = 0; i < bytes.length; i += 4) {
            this.bitArray.push(dataView.getUint32(i, true)); // Little-endian
        }
        return this;
    }

    /**
     * Выполняет слияние текущего битового массива с другим массивом битов по логическому OR.
     * @param other Массив битов для слияния.
     */
    public merge(other: BitList): void {
        if (other.bitArray.length > this.bitArray.length) {
            throw new Error("The length of the other BitArray must be less than or equal to the current BitArray.");
        }
        for (let i = 0; i < other.bitArray.length; i++) {
            this.bitArray[i] |= other.bitArray[i]; // Побитовое OR
        }
    }
}