export  function useCurrency() {
    return {
        /**Конвертация значения валюты в модели в значение в представлении */
        currencyM2V: (val: number)=> val/100,
        /**Конвертация значения валюты из представления  в значение в модели */
        currencyV2M: (val: number)=> val*100,
    }
}
