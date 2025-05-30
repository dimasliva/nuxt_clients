import { Container, inject, injectable, optional } from 'inversify';
import { QueryParams } from '~/src/common/lib/MoApi/RequestArgs';
import ClientProfileDialog from '~forms/WindowDialogs/~sub/EditWindowDialogs/~sub/ProfileDialogs/ClientProfileDialog.vue';
import * as Utils from '~/src/common/lib/Utils';
import * as vHelpers from '~uilib/Helpers';
import type { IDataTableDescription, IDataTableHeadersDescription } from '~/src/widgets/DataTables/index';
import { ClientRecord } from '~/src/common/lib/MoApi/Records/ClientRecord';
import { ClientDocumentsRecord } from '~/src/common/lib/MoApi/Records/ClientDocumentsRecord';
import { ClientSdRecord } from '~/src/common/lib/MoApi/Records/ClientSdRecord';
import { ClientAddressesRecord } from '~/src/common/lib/MoApi/Records/ClientAddressesRecord';
import { ClientContactsRecord } from '~/src/common/lib/MoApi/Records/ClientContactsRecord';
import { ListTemplate, type IListTemplateProps } from '../ListTemplate';
import { ClientsViews } from '~/src/common/lib/MoApi/Views/ClientsViews';
import { getDateStr, recognizeDataInString } from '~/src/common/lib/Utils';
import { EDataType } from '~/src/common/lib/globalTypes';




type TClientFilterVals = {
    fio?: string | null;
    phone?: string | null;
    email?: string | null;
    snils?: string | null;
}


export class ClientList extends ListTemplate<TClientFilterVals> {

    protected _clientsViews: ClientsViews = null!;

    constructor(diC: Container, opts?: IListTemplateProps | null) {
        super(diC, opts);
        this._clientsViews = diC.get(ClientsViews);
    }


    PAGE_TITLE = "Клиенты";

    //Настройки по умолчанию
    defPageSettings = { tcols: ["fio", "bd", "mainPhone", "mainEmail"] };

    //колонка, значения из которой будут отображаться в списке выбранных
    override titleColName = "fio";

    //Указание компонента формы редакции модели
    modelEditDialog = ClientProfileDialog;

    //Настрока таблицы
    dataTableDescr = ref<IDataTableDescription>({
        headers: [
            { key: 'fio', title: 'ФИО', align: 'center', alignData: "start", width: "400", sortable: true, requestNames: ["name", "surname", "patronymic"] },
            { key: 'bd', title: 'Дата рождения', align: 'center', alignData: "center", width: "250", sortable: true, requestNames: ["birthdate"] },
            { key: 'gen', title: 'Пол', align: 'center', alignData: "center", width: "50", sortable: true, requestNames: ["gender"] },
            { key: 'mainPhone', title: 'Телефон', align: 'center', alignData: "center", width: "220", sortable: true, traits: { dbClientContacts: "r" }, requestNames: ["mainPhone"] },
            { key: 'mainEmail', title: 'Электронная почта', align: 'center', alignData: "center", width: "240", sortable: true, traits: { dbClientContacts: "r" }, requestNames: ["mainEmail"] },
            { key: 'snils', title: 'СНИЛС', align: 'center', alignData: "center", sortable: true, traits: { dbClientDocuments: "r" }, requestNames: ["snils"] }
        ],

        actionsMenu: (item) => [
            { id: "1", title: "Редакировать", icon: "mdi-pencil", disabled: false, action: () => this.edit(item.key, item.index), traits: { dbClient: "u" } },
            { id: "2", title: "Удалить", icon: "mdi-delete", disabled: false, action: () => { this.del(item.key, item.index) }, traits: { dbClient: "d" } },

        ]
    });

    async del(key: string, index) {
        await this._onDelModel("Вы действительно хотите удалить запись клиента?", ClientRecord, key, index);
    }

    chkFioRule = (v: string) => {
        let recdata = recognizeDataInString(v);
        return (recdata.words.length == 0 && !v) || (recdata.words.length > 0 && recdata.words[0].length >= 2) || "Минимум 2 символа фамилии"
    }

    //Настрока формы фильтра
    filterFieldSetting = {
        fields: {
            fio: {
                type: EDataType.string,
                title: "ФИО, Дата рождения",
                hint: null,
                rules: [(v: string) => this.chkFioRule(v)],
                constraints: { min: 2, max: 384, check: (v) => this.chkFioRule(v) == true },
            },

            email: {
                type: "string",
                title: "Электронная почта",
                hint: "Введите минимум 2 символа",
                rules: [(v: string) => !v || v.length >= 2 || "Минимум 2 символа"],
                constraints: { min: 2, max: 64 },
                traits: { dbClientContacts: "r" }
            },

            phone: {
                type: EDataType.string,
                title: "Телефон",
                hint: "Введите минимум 6 символов",
                rules: [],
                constraints: { min: 6, mask: '#-###-###-##-##-###-###' },
                traits: { dbClientContacts: "r" }
            },

            snils: {
                type: EDataType.string,
                title: "СНИЛС",
                hint: "Введите минимум 2 символа",
                rules: [],
                constraints: { mask: '###-###-### ##' },
                traits: { dbClientDocuments: "r" }
            }
        },

        defaultFocus: "fio"
    };


    //Получение строки поиска из данных, введеных в форме фильтра
    getWhereFromFilter = (filterVals: TClientFilterVals) => {
        let whereArr: string[] = [];
        let fioStr = Utils.normalizeFio(filterVals.fio);
        let phone = '';
        let email = '';

        if (fioStr) {
            let recdata = recognizeDataInString(fioStr);

            let fioArr = recdata.words;
            fioArr[fioArr.length - 1] += '%';
            whereArr.push(`surname like '${fioArr[0]}'`);
            if (fioArr[1]) whereArr.push(`name like '${fioArr[1]}'`);
            if (fioArr[2]) whereArr.push(`patronymic like '${fioArr[2]}'`);

            if (recdata.date)
                whereArr.push(`birthdate= '${getDateStr(recdata.date)}'`);


            phone = recdata.phone || '';
            email = recdata.email || '';
        }

        let tmp = filterVals.phone?.trim() || phone;
        if (tmp) whereArr.push(`mainPhone='${tmp}'`);
        tmp = filterVals.email?.trim() || email;
        if (tmp) whereArr.push(`mainEmail='${tmp}'`);
        tmp = filterVals.snils?.trim() || '';
        if (tmp) whereArr.push(`snils='${tmp}'`);

        if (whereArr.length == 0) return "";
        return whereArr.join(" and ");
    }

    //Конвертация данных из формата апи в формат для таблицы
    convertRow = async (rawData) => {
        return {
            id: rawData.id,
            fio: (rawData.surname || "") + " " + (rawData.name || "") + " " + (rawData.patronymic || ""),
            bd: rawData.birthdate ? new Intl.DateTimeFormat().format(new Date(rawData.birthdate)) : "",
            gen: vHelpers.getGenderStr(rawData.gender),
            mainPhone: rawData.mainPhone,
            mainEmail: rawData.mainEmail,
            snils: rawData.snils
        }
    };

    //Вызывается при изменении модели и необходимости обновления 1 строчки в таблице
    onUpdateModel(key, index?) {

        (async () => {
            var row;

            if (index != null)
                row = this.dataTableVars.value.rows[index]
            else
                row = this.dataTableVars.value.rows.find((i) => i.id == key);

            if (row) {
                let rec = await this._recStore.fetch(ClientRecord, key);
                let recDoc = await this._recStore.getOrCreate(ClientDocumentsRecord, key);
                let recAddr = await this._recStore.getOrCreate(ClientAddressesRecord, key);
                let recCont = await this._recStore.getOrCreate(ClientContactsRecord, key);
                let recSd = await this._recStore.getOrCreate(ClientSdRecord, key);

                row.fio = (rec.Data!.surname || "") + " " + (rec.Data!.name || "") + " " + (rec.Data!.patronymic || "");
                row.bd = rec.Data!.birthdate ? new Intl.DateTimeFormat().format(new Date(rec.Data!.birthdate)) : "";
                row.gen = vHelpers.getGenderStr(rec.Data!.gender);
                row.mainPhone = recCont.Data!.mainPhone;
                row.mainEmail = recCont.Data!.mainEmail;
                row.snils = recDoc.Data!.snils;
            }
        })();

        return true;
    }


    //получения данных из апи
    async getApiData(params: QueryParams) {
        return await this._clientsViews.getClientListView(params);
    }

}