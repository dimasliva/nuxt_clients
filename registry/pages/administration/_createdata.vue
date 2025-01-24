<template>
    <VRow class="ml-4">
        <VCol style="max-width: 150px;">
            <v-text-field v-model="clientsLoading.size" variant="underlined" label="Клиенты" hide-details="auto" />
            <v-btn :loading="clientsLoading.loading" type="submit" @click="createRecs(clientsLoading)">
                Создать
                <template v-slot:loader>
                    <v-progress-linear absolute height="7" indeterminate></v-progress-linear>
                </template>
            </v-btn>
        </VCol>
        <VCol style="max-width: 150px;">
            <v-text-field v-model="emplLoading.size" variant="underlined" label="Сотрудники" hide-details="auto" />
            <v-btn :loading="emplLoading.loading" type="submit" @click="createRecs(emplLoading)">Создать</v-btn>
        </VCol>
        <VCol style="max-width: 150px;">
            <v-text-field v-model="scheduleItemGroup" variant="underlined" label="Название раздела расписания"
                hide-details="auto" />
            <v-btn :loading="scheduleGroupLoading.loading" type="submit"
                @click="createRecS(scheduleGroupLoading)">Создать</v-btn>
        </VCol>
        <VCol style="max-width: 300px;">
            <v-text-field v-model="productsCatalogName" variant="underlined" label="Название прайса"
                hide-details="auto" />
            <v-text-field v-model="productsCatalogSectionQuantity" variant="underlined" label="Кол-во разделов прайса"
                hide-details="auto" />
            <v-text-field v-model="priceListLoading.size" variant="underlined" label="Кол-во номенклатурных позиций"
                hide-details="auto" />
            <v-btn :loading="priceListLoading.loading" type="submit" @click="addProductsCatalog(productsCatalogName)">
                Создать прайс-лист
                <template v-slot:loader>
                    <v-progress-linear absolute height="7" indeterminate></v-progress-linear>
                </template>
            </v-btn>
        </VCol>
        <VCol style="max-width: 150px;">
            <v-text-field v-model="clientGroupLoading.size" variant="underlined" label="Группы клиентов"
                hide-details="auto" />
            <v-btn :loading="clientGroupLoading.loading" type="submit"
                @click="createRecS(clientGroupLoading)">Создать</v-btn>

            <v-text-field v-model="productGroupLoading.size" variant="underlined" label="Группы продуктов"
                hide-details="auto" />
            <v-btn :loading="productGroupLoading.loading" type="submit"
                @click="createRecS(productGroupLoading)">Создать</v-btn>
        </VCol>
        <VCol style="max-width: 150px;">
            <v-text-field v-model="bookingLoading.size" variant="underlined" label="Предварительная запись"
                hide-details="auto" />
            <v-btn :loading="bookingLoading.loading" type="submit" @click="createRecS(bookingLoading)">Создать</v-btn>
        </VCol>

        <VCol style="max-width: 150px;">
            <v-text-field v-model="orderLoading.size" variant="underlined" label="Заказы" hide-details="auto" />
            <v-btn :loading="orderLoading.loading" type="submit" @click="createRecs(orderLoading)">Создать</v-btn>

        </VCol>
    </VRow>

    <VRow class="align-center">

        <VBtn @click="openselect()">select</VBtn>

    </VRow>

</template>


<script setup lang="ts">
import { EmployeeRecord, EmployeeRecordData } from '~~/lib/MoApi/Records/EmployeeRecord';
import { EmployeeContactsRecord, EmployeeContactsRecordData } from '~~/lib/MoApi/Records/EmployeeContactsRecord';
import { RecordsStore } from '~~/lib/MoApi/Records/RecordsStore';
import { ClientRecord, ClientRecordData } from '~~/lib/MoApi/Records/ClientRecord';
import { ClientContactsRecord } from '~~/lib/MoApi/Records/ClientContactsRecord';
import { ProductRecord, ProductRecordData } from '~~/lib/MoApi/Records/ProductRecord';
import { ProductsCatalogRecord, ProductsCatalogRecordData } from '~~/lib/MoApi/Records/ProductsCatalogRecord';
import { ProductsCatalogSectionRecord, ProductsCatalogSectionRecordData } from '~~/lib/MoApi/Records/ProductsCatalogSectionRecord';
import { ScheduleItemRecord, ScheduleItemData } from '~/lib/MoApi/Records/ScheduleItemRecord';
import { ScheduleItemGroupData, ScheduleItemGroupRecord } from '~/lib/MoApi/Records/SchedulerItemGroupRecord';
import ProductTitles from '~/public/ProductTitles';
import { PositionRecord, PositionRecordData } from '~/lib/MoApi/Records/PositionRecord';
import ScheduleTimeSpanEntity, { EEmployeeTimeTypes } from '~/lib/MoApi/Records/DataEntities/ScheduleTimeSpanEntity';
import { ProductGroupRecord, ProductGroupRecordData } from '~/lib/MoApi/Records/ProductGroupRecord';
import { ClientGroupRecord, ClientGroupRecordData } from '~/lib/MoApi/Records/ClientGroupRecord';
import * as Utils from '~/lib/Utils';
import { ScheduleGrid, ScheduleGridOptions, type TBookingParams } from '~/lib/Booking/ScheduleGrid';
import { BookingRecord, BookingRecordData } from '~/lib/MoApi/Records/BookingRecord';
import { Locks } from '~/lib/MoApi/Locks';
import { ApiLock } from '~/lib/MoApi/ApiLock';
import { ClientsViews } from '~/lib/MoApi/Views/ClientsViews';
import { PositionsViews } from '~/lib/MoApi/Views/PositionsViews';
import { QueryParams } from '~/lib/MoApi/RequestArgs';
import { ProductViews } from '~/lib/MoApi/Views/ProductViews';
import { RelationApiSection } from '~/lib/MoApi/ApiSectionsV1/RelationApiSection';
import * as  BookingStatuses from '~/lib/Dicts/DictBookingStatusesConst';
import { ClientList } from '~/componentTemplates/listTemplates/clientListTemplate';
import TemplateFrame from '~/components/TemplateFrame.vue';
import { VBtn } from 'vuetify/components';
import MultiselectForm from '~/components/forms/MultiselectForm.vue';
import { PositionList } from '~/componentTemplates/listTemplates/positionListTemplate';
import { SelectFormTemplate } from '~/componentTemplates/forms/selectFormTemplate';
import { EmployeeFioFinderDataProvider } from '~/libVis/FinderDataProviders/EmployeeFioFinderDataProvider';
import { ProductFinderDataProvider } from '~/libVis/FinderDataProviders/ProductFinderDataProvider';
import { AddDealArgs } from '~/lib/MoApi/Records/DealRecord';
import { AddDealOrderArgs, DealOrderRecord } from '~/lib/MoApi/Records/DealOrderRecord';
import { PriceSetup } from '~/lib/MoApi/Records/Finance/PriceSetup';

const diC = useContainer();
const recStore = diC.get(RecordsStore);


let productsCatalogSectionQuantity = ref(0)
let productsCatalogName = ref('')
let scheduleItemGroup = ref('')
let scheduleItemGroupLoader = ref(false)


const createRecs = async (recLoading: typeof emplLoading) => {

    const size = recLoading.size;
    const recCreateTask = recLoading.createTask;

    if (size != 0) {
        recLoading.loading = true;
        try {
            console.info(`${recLoading.recName} create started`);
            var itemsPertasks = Math.floor(size / 8);
            var promises: Promise<void>[] = [];
            promises.push(recCreateTask(itemsPertasks));
            promises.push(recCreateTask(itemsPertasks));
            promises.push(recCreateTask(itemsPertasks));
            promises.push(recCreateTask(itemsPertasks));
            promises.push(recCreateTask(itemsPertasks));
            promises.push(recCreateTask(itemsPertasks));
            promises.push(recCreateTask(itemsPertasks));
            promises.push(recCreateTask(itemsPertasks));

            await Promise.all(promises);
            var cnt = size % 8;
            if (cnt)
                await recCreateTask(cnt);
            console.info(`${recLoading.recName} created`);
        }
        finally {
            recLoading.loading = false;
        }
    }
}


const createRecS = async (recLoading: typeof emplLoading) => {
    console.info(`${recLoading.recName} create started`);
    recLoading.loading = true;
    try {
        await recLoading.createTask(recLoading.size * 1);
    }
    finally {
        console.info(`${recLoading.recName} created`);
        recLoading.loading = false;
    }
}




const genders = ["m", "f"];
const namesM = ["Иван", "Петр", "Сергей", "Андрей", "Дмитрий", "Александр", "Михаил", "Николай", "Владимир", "Олег", "Артем", "Алексей", "Константин", "Виктор", "Геннадий", "Григорий", "Евгений", "Егор", "Захар", "Игорь", "Кирилл", "Леонид", "Максим", "Роман", "Руслан", "Семен", "Станислав", "Тимофей", "Федор", "Юрий", "Ярослав"];
const namesF = ["Анастасия", "Александра", "Алина", "Анна", "Валерия", "Виктория", "Галина", "Дарья", "Екатерина", "Елена", "Ирина", "Карина", "Кристина", "Лариса", "Любовь", "Маргарита", "Марина", "Надежда", "Наталья", "Оксана", "Ольга", "Полина", "Светлана", "Татьяна", "Ульяна", "Юлия"];
const surnamesM = ["Иванов", "Петров", "Сидоров", "Кузнецов", "Смирнов", "Михайлов", "Федоров", "Соколов", "Новиков", "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов", "Егоров", "Павлов", "Козлов", "Степанов", "Николаев", "Орлов", "Андреев", "Макаров", "Никитин", "Захаров", "Зайцев", "Соловьев", "Борисов", "Яковлев", "Григорьев", "Романов", "Воробьев"];
const surnamesF = ["Сергеева", "Кузьмина", "Новикова", "Морозова", "Волкова", "Алексеева", "Лебедева", "Семенова", "Егорова", "Павлова", "Козлова", "Степанова", "Николаева", "Орлова", "Андреева", "Макарова", "Никитина", "Захарова", "Зайцева", "Соловьева", "Борисова", "Яковлева", "Григорьева", "Романова", "Воробьева"]
const patronymicsM = ["Иванович", "Петрович", "Сергеевич", "Андреевич", "Дмитриевич", "Александрович", "Михайлович", "Николаевич", "Владимирович", "Олегович", "Артемович", "Алексеевич", "Константинович", "Викторович", "Геннадьевич", "Григорьевич", "Евгеньевич", "Егорович", "Захарович", "Игоревич", "Кириллович", "Леонидович", "Максимович", "Романович", "Русланович", "Семенович", "Станиславович", "Тимофеевич", "Федорович", "Юрьевич", "Ярославович"];
const patronymicsF = ["Ивановна", "Петровна", "Сергеевна", "Андреевна", "Дмитриевна", "Александровна", "Михайловна", "Николаевна", "Владимировна", "Олеговна", "Артемовна", "Алексеевна", "Константиновна", "Викторовна", "Геннадьевна", "Григорьевна", "Евгеньевна", "Егоровна", "Захаровна", "Игоревна", "Кирилловна", "Леонидовна", "Максимовна", "Романовна", "Руслановна", "Семеновна", "Станиславовна", "Тимофеевна", "Федоровна", "Юрьевна", "Ярославовна"]

const pricesA = [10000, 20000, 30000, 40000, 50000, 60000, 70000, 85039, 92348, 100000, 125000, 110000, 120000, 130000, 140000, 150000, 160000, 170000, 180000, 190000, 200000, 250000, 300000, 350000, 400000, 450000, 500000, 600000, 700000, 800000, 1000000,];

const fullTitles = ProductTitles;
const durations = [0, 5, 10, 15, 20, 25, 30, 40, 60, 90, 120];
let scheduleGroupRec = ref();
let tempProdRecArr = ref<any>([])
let tempPositionArr = ref<any>([])

const addEmployee = async (name: string, surname: string, patronymic: string, gender: string, birthdate: string, phone?: string, mail?: string) => {
    let rec = await recStore.createNew<EmployeeRecord, EmployeeRecordData>(EmployeeRecord, (data) => {
        data.name = name;
        data.surname = surname;
        data.patronymic = patronymic;
        data.gender = gender;
        data.birthdate = generateRandomDate();
        data.roles = "admin";
    })
    await rec.save();

    let emplcont = await recStore.getOrCreate(EmployeeContactsRecord, rec.Key);
    emplcont.MData!.mainEmail = mail || null;
    emplcont.MData!.mainPhone = phone || null;
    await emplcont.save();
    return rec.Key;
}



const emplCreateTask = async (size: number) => {
    for (let i = 0; i < size; i++) {
        let gender = genders[Math.floor(Math.random() * genders.length)];
        let name = '';
        let surname = '';
        let patronymic = '';
        if (gender == 'm') {
            name = namesM[Math.floor(Math.random() * namesM.length)];
            surname = surnamesM[Math.floor(Math.random() * surnamesM.length)];
            patronymic = patronymicsM[Math.floor(Math.random() * patronymicsM.length)];
        } else {
            name = namesF[Math.floor(Math.random() * namesF.length)];
            surname = surnamesF[Math.floor(Math.random() * surnamesF.length)];
            patronymic = patronymicsF[Math.floor(Math.random() * patronymicsF.length)];
        }
        const year = Math.floor(Math.random() * (2003 - 1950 + 1)) + 1950;
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const birthdate = `${day < 10 ? "0" + day : day}.${month < 10 ? "0" + month : month}.${year}`;
        let emplkey = await addEmployee(name, surname, patronymic, gender, birthdate, generatePhoneNumber(), generateEmailAddress()); //1

        await addPosition(emplkey);
    }
}


const addPosition = async (emplkey) => {
    let rec = await recStore.createNew<PositionRecord, PositionRecordData>(PositionRecord, (data) => {
        data.employee = emplkey;
        data.position = positionDictCodes[Math.floor(Math.random() * positionDictCodes.length - 1)]!;
    });
    await rec.save();
    tempPositionArr.value.push(rec.Key)
};


// типы временных отрезков:
// 1 - работа
// 2 - совещание
// 3 - обед
// 4 - перерыв

const timeSpansCrtr = () => {
    let a: ScheduleTimeSpanEntity[] = [];

    for (let i = 0; i < Math.floor(Math.random() * (20 - 2) + 2); i++) {
        a.push(recStore.dataEntityFactory(ScheduleTimeSpanEntity, {
            "time": Math.floor(Math.random() * (144 - 36) + 36) * 10,
            "duration": Math.floor(Math.random() * (12 - 1) + 1) * 10,
            "type": 1,
        }))
    }
    return a
}

let recCode = ref(0);
let key = ref('')
const addScheduleItem = async (size: number) => {
    for (let i = 0; i < size; i++) {

        let rec = await recStore.createNew<ScheduleItemRecord, ScheduleItemData>(ScheduleItemRecord, (data) => {
            data.position = randomPicker(tempPositionArr.value);
            data.beginDate = new Date().toISOString().slice(0, 10);
            data.endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);
            data.activityDays = Math.floor(Math.random() * (8 - 3) + 3);
            data.pauseDays = 7 - data.activityDays;
            data.exceptions = new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * (365 - 2) + 2))).toLocaleDateString().slice(0, 5);
            data.workExceptions = new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * (365 - 2) + 2))).toLocaleDateString().slice(0, 5);
            data.timespans = timeSpansCrtr();
            data.defDuration = durations[Math.floor(Math.random() * durations.length)] || 5;
        });
        await rec.save();
        recCode.value = rec.RecCode;
        key.value = rec.Key;

        await scheduleGroupRec.value.addCoupling(key.value, recCode.value)
        await rec.addChild(randomPicker(tempProdRecArr.value), 1024, 0)
    }
}

//варианты дат: число каждого месяца- 12, число в определенном месяце каждого года- 12.03, конкретная дата-12.03.2023
//диапазон например: 01.05-03.05 
//пример строки исключения: 01.05-05.05;09.05; = исключение действует с 1 по 5 мая и 9 мая

const addScheduleItemGroup = async () => {
    let rec = await recStore.createNew<ScheduleItemGroupRecord, ScheduleItemGroupData>(ScheduleItemGroupRecord, (data) => {
        data.title = scheduleItemGroup.value;
        data.code = null;
        data.description = null;
        data.notActive = false;
        data.temporaryNotActive = false;
        data.advData = null;
    })
    await rec.save();
    scheduleGroupRec.value = rec;
}

const scheduleCreateTask = async () => {
    await addScheduleItemGroup();
    await emplCreateTask(emplLoading.size);
    await addProductsCatalog(productsCatalogName.value);
    await addScheduleItem(emplLoading.size)
}

const addClient = async (name: string, surname: string, patronymic: string, gender: string, birthdate: string, phone?: string, mail?: string) => {
    let rec = await recStore.createNew<ClientRecord, ClientRecordData>(ClientRecord, (data) => {
        data.name = name;
        data.surname = surname;
        data.patronymic = patronymic;
        data.gender = gender;
        data.birthdate = generateRandomDate();
    })
    await rec.save();

    let reccont = await recStore.getOrCreate(ClientContactsRecord, rec.Key);
    reccont.MData!.mainEmail = mail || null;
    reccont.MData!.mainPhone = phone || null;
    reccont.save();
}



const clientsCreateTask = async (size: number) => {
    for (let i = 0; i < size; i++) {
        let gender = genders[Math.floor(Math.random() * genders.length)];
        let name = '';
        let surname = '';
        let patronymic = '';
        if (gender == 'm') {
            name = namesM[Math.floor(Math.random() * namesM.length)];
            surname = surnamesM[Math.floor(Math.random() * surnamesM.length)];
            patronymic = patronymicsM[Math.floor(Math.random() * patronymicsM.length)];
        } else {
            name = namesF[Math.floor(Math.random() * namesF.length)];
            surname = surnamesF[Math.floor(Math.random() * surnamesF.length)];
            patronymic = patronymicsF[Math.floor(Math.random() * patronymicsF.length)];
        }
        const year = Math.floor(Math.random() * (2003 - 1950 + 1)) + 1950;
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const birthdate = `${day < 10 ? "0" + day : day}.${month < 10 ? "0" + month : month}.${year}`;
        await addClient(name, surname, patronymic, gender, birthdate, generatePhoneNumber(), generateEmailAddress());
    }
}



let currElement = ref(0)
let catalogKey = ref('')
const addProductsCatalog = async (title) => {
    priceListLoading.loading = true;
    console.log('start creating products and catalogs')
    let rec = await recStore.createNew<ProductsCatalogRecord, ProductsCatalogRecordData>(ProductsCatalogRecord, (data) => {
        data.title = title;
        data.code = null;
        data.comments = null;
        data.temporaryNotActive = false;
        data.notActive = false;
        data.advData = null
    })
    await rec.save()

    catalogKey.value = rec.Key;
    for (let i = 0; i < productsCatalogSectionQuantity.value; i++) {
        await addProductsCatalogSection(i, catalogKey.value);
    }
    priceListLoading.loading = false;
    console.log('products and catalogs creating end')
}



const addProductsCatalogSection = async (quantity, prodCat) => {
    let recSection = await recStore.createNew<ProductsCatalogSectionRecord, ProductsCatalogSectionRecordData>(ProductsCatalogSectionRecord, (data) => {
        data.title = 'Раздел' + (quantity + 1).toString();
        data.code = null;
        data.comments = null;
        data.productsCatalog = prodCat;
        data.temporaryNotActive = false;
        data.notActive = false;
        data.advData = null
    })
    await recSection.save()
    await productsCreate(priceListLoading.size, recSection.Key);
}



const productsCreate = async (size: number, key) => {
    for (let i = 0; i < size; i++) {
        currElement.value == fullTitles.length ? currElement.value = 0 : currElement.value++;
        let title: any = fullTitles[currElement.value];
        let fullTitle: any = title;
        let code: any = generateUniqueStrings(1, 1);
        let productsCatalog = catalogKey.value;
        let productsCatalogSection = key;
        let prices = generateRandomPrices(pricesA);
        let duration = durations[Math.floor(Math.random() * durations.length)];
        let comments: any = generateUniqueStrings(1, 3);
        await addProducts(title, fullTitle, code, productsCatalog, productsCatalogSection, prices, duration, comments);
    }
}



const addProducts = async (title: string, fullTitle: string, code: string, productsCatalog: string, productsCatalogSection: string, prices: any, duration: number, comments: string) => {
    let rec = await recStore.createNew<ProductRecord, ProductRecordData>(ProductRecord, (data) => {
        data.title = title || "test";
        data.fullTitle = fullTitle;
        data.code = code;
        data.productsCatalog = productsCatalog;
        data.productsCatalogSection = productsCatalogSection;
        data.duration = duration;
        data.prices = prices;
        data.comments = comments;
    })
    await rec.save();
    tempProdRecArr.value.push(rec.MData.id)
}

const emplLoading = reactive({ size: 0, loading: false, recName: "employees", createTask: emplCreateTask });
const clientsLoading = reactive({ size: 0, loading: false, recName: "clients", createTask: clientsCreateTask });
const priceListLoading = reactive({ size: 0, loading: false, recName: "products", createTask: productsCreate });

// Генерация случайного индекса в пределах длины массива
const randomPicker = (arr: any[]): any => {
    const randInd = Math.floor(Math.random() * arr.length);
    return arr[randInd];
}


const generateRandomPrices = (prices: number[]) => {
    const randomPrices: { [key: string]: number } = {};

    // Генерация случайного количества объектов (1-2)
    const count = Math.floor(Math.random() * 2) + 1;

    // Генерация случайных индексов из массива цен
    const randomIndexes: any = [];
    while (randomIndexes.length < count) {
        const randomIndex = Math.floor(Math.random() * prices.length);
        if (!randomIndexes.includes(randomIndex)) {
            randomIndexes.push(randomIndex);
        }
    }

    // Создание JSON объекта с случайными значениями
    randomIndexes.forEach((index, i) => {
        randomPrices[(i + 1).toString()] = prices[index];
    });

    return randomPrices;
};



function generatePhoneNumber() {
    let phoneNumber = "7"; // Assuming the country code is +1 for the United States
    // Generate the remaining 10 digits of the phone number
    for (let i = 0; i < 10; i++) {
        phoneNumber += Math.floor(Math.random() * 10);
    }
    return phoneNumber;
}



function generateEmailAddress() {
    const emailProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"];
    const randomProviderIndex = Math.floor(Math.random() * emailProviders.length);
    const emailProvider = emailProviders[randomProviderIndex];
    let email = "";
    // Generate a random string of characters for the email address
    for (let i = 0; i < 10; i++) {
        const randomCharCode = Math.floor(Math.random() * 26) + 97; // ASCII code for lowercase letters
        const randomChar = String.fromCharCode(randomCharCode);
        email += randomChar;
    }
    email += "@" + emailProvider;
    return email;
}


function generateRandomDate(): string {
    const start = new Date(1950, 0, 1).getTime();
    const end = new Date().getTime();
    const randomTime = Math.random() * (end - start) + start;
    const randomDate = new Date(randomTime);
    return randomDate.toISOString().split('T')[0];
}

// Генерация случайного символа
function getRandomChar() {
    const characters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЪЭЬЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
}

// Генерация неповторяющейся строки
function generateUniqueStrings(count, length) {
    const uniqueStrings = new Set();
    while (uniqueStrings.size < count) {
        let string = '';
        while (string.length < length) {
            string += getRandomChar();
        }
        uniqueStrings.add(string);
    }
    return <string>Array.from(uniqueStrings)[0];
}


const positionDictCodes = [
    1048910, 1048911, 1049003, 1049004, 1048912, 1048913, 1049005, 1049006, 1049007, 1049008, 1049009, 1049010, 1049011, 1049012, 1049013, 1049014, 1049098, 1049099, 1049100, 1049091, 1049090,
    1049089, 1049096, 1049097, 1049101, 1048916, 1048917, 1048918, 1048919, 1048920, 1048921, 1048587, 1048589, 1048590, 1048591, 1048592];



///////////////// ЖПЗ /////////////////////////

let clientIds: string[] = [];
let productIds: string[] = [];

const getRandomClients = async (count: number) => {
    if (clientIds.length == 0)
        clientIds = await recStore.findRecords(ClientRecord, null);

    const res: string[] = [];
    for (let i = 0; i < count; i++)
        res.push(clientIds[~~(Math.random() * (clientIds.length - 1))]);

    return res;
}


const getRandomProducts = async (count: number) => {
    if (productIds.length == 0)
        productIds = await recStore.findRecords(ProductRecord, null);

    const res: string[] = [];
    for (let i = 0; i < count; i++)
        res.push(productIds[~~(Math.random() * (productIds.length - 1))]);

    return res;
}



const addProductGroup = async () => {
    let rec = await recStore.createNew<ProductGroupRecord, ProductGroupRecordData>(ProductGroupRecord, (data) => {
        data.title = generateUniqueStrings(2, 8);
    })
    await rec.save();

    return rec;
}



const addClientGroup = async () => {
    let rec = await recStore.createNew<ClientGroupRecord, ClientGroupRecordData>(ClientGroupRecord, (data) => {
        data.title = generateUniqueStrings(2, 8);
    })
    await rec.save();

    return rec;
}



const addProductsToGroup = async (rec: ProductGroupRecord, products: string[]) => {
    var promises: Promise<void>[] = [];
    for (let y = 0; y < products.length; y++) {
        promises.push(rec.addCoupling(products[y], ProductRecord.RecCode));
    }
    await Promise.all(promises);
}


const productGroupsCreateTask = async (size: number) => {
    const maxItemsInGroup = 10;
    for (let i = 0; i < size; i++) {
        let rec = await addProductGroup();
        const products = await getRandomProducts(Math.random() * maxItemsInGroup);
        await addProductsToGroup(rec, products);
    }
}



const addClientsToGroup = async (rec: ClientGroupRecord, clients: string[]) => {
    var promises: Promise<void>[] = [];
    for (let y = 0; y < clients.length; y++) {
        promises.push(rec.addCoupling(clients[y], ClientRecord.RecCode));
    }
    await Promise.all(promises);
}


const clientGroupsCreateTask = async (size: number) => {
    const maxItemsInGroup = 10;
    for (let i = 0; i < size; i++) {
        let rec = await addClientGroup();
        const clients = await getRandomClients(Math.random() * maxItemsInGroup);
        await addClientsToGroup(rec, clients);
    }
}



const bookingCreateTask = async (size: number = 500) => {
    const PERIOD_DAYS = 31;
    const begDate = new Date();
    const endDate = Utils.addDaysToDate(begDate, PERIOD_DAYS);
    const bookingParamSet = await getBookingParams(begDate, endDate);

    //набор продуктов для запроса расписания
    const prodsraw = bookingParamSet.map(v => v.products?.[0]).filter(v => v);
    const prods = [...new Set(prodsraw)];

    const schGrid = diC.get(ScheduleGrid);
    const opts = new ScheduleGridOptions(begDate, endDate);
    opts.productIds = prods as string[];
    opts.bookingStatuses = [BookingStatuses.ACTIVE];

    await schGrid.init(opts);

    let attemp = size * 10;

    while (size && attemp--) {
        const date = Utils.addDaysToDate(begDate, ~~(Math.random() * PERIOD_DAYS));

        const bookingparam = bookingParamSet[~~(Math.random() * (bookingParamSet.length - 1))];

        const begTime = ~~((Math.random() * (13 * 60) + (7 * 60)) / 5) * 5; //случайное время с 7.00 до 20.00 кратное 5 минутам
        const endTime = begTime + ~~(Math.random() * (2 * 60) + (1 * 60) / 5) * 5; //случайное окно для поиска

        const duration = ~~(Math.random() * 60 / 5) * 5;

        let products: string[] = [];
        if (Math.random() > 0.3 || bookingparam.products!.length < 2) {
            products.push(bookingparam.products![~~(Math.random() * (bookingparam.products!.length - 1))]);
        }
        else {
            let bi = Math.random() * (bookingparam.products!.length - 2);
            products = bookingparam.products!.slice(bi);
        }

        const dt = schGrid.getEmptyTimeForBooking({
            begDate: date,
            endDate: date,
            begTime,
            endTime,
            booking: {
                duration,
                position: bookingparam.position,
                division: bookingparam.division,
                placement: bookingparam.placement,
                products,
                tsTypes: [EEmployeeTimeTypes.WORK],
            }
        });

        if (dt) {
            const bp: TBookingParams = {
                duration: duration || dt.duration,
                position: bookingparam.position,
                division: bookingparam.division,
                placement: bookingparam.placement,
                products
            }

            await createBooking(schGrid, dt, bp);
            // await Utils.sleep(950);
            size--;
        }
    }
}


/**Формирует набор параметров брони из набора элементов расписания*/
const getBookingParams = async (begDate: Date, endDate: Date) => {
    const ids = await recStore.findRecords(ScheduleItemRecord, `beginDate<='${Utils.getDateStr(endDate)}' and endDate>='${Utils.getDateStr(begDate)}'`);
    const recs: ScheduleItemRecord[] = await recStore.getRecords(ScheduleItemRecord, ids.slice(0, 499));
    const res: TBookingParams[] = [];
    const relApiSect = diC.get(RelationApiSection);

    for (let i = 0; i < recs.length; i++) {
        const rec = recs[i];
        const bp: TBookingParams = {
            begTime: 0,
            duration: 0,
            position: rec.Data!.position,
            division: rec.Data!.division,
            placement: rec.Data!.placement
        }

        //загрузка продуктов, привязанных к элементу расписания
        const productrels = await rec.getChilds(ProductRecord.RecCode);
        const products = productrels.map(v => v.id);

        //загрузка групп,привязанных к элементу расписания
        const grouprels = await rec.getChilds(ProductGroupRecord.RecCode);

        //загрузка продуктов из каждой группы 
        for (let j = 0; j < grouprels.length; j++) {
            const grkey = grouprels[j].id;
            const grprodrec = recStore.get(ProductGroupRecord, grkey);//получение объекта записи без загрузки данных
            const grprodrel = await grprodrec.getCouplings(ProductRecord.RecCode);
            grprodrel.forEach(v => {
                if (!products.includes(v.key))
                    products.push(v.key);
            })
        }

        bp.products = products;
        if (products.length > 0)
            res.push(bp);
    }
    return res;
}



const createBooking = async (sg: ScheduleGrid, bd: { date: Date, duration: number }, bookingParams: TBookingParams) => {

    let rec = await recStore.createNew<BookingRecord, BookingRecordData>(BookingRecord, d => {
        d.beginDate = Utils.getLocalISODateTimeWoTz(bd.date);
        d.duration = bookingParams.duration || bd.duration;
        d.position = bookingParams.position || null;
        d.division = bookingParams.division || null;
        d.placement = bookingParams.placement || null;
        d.status = BookingStatuses.ACTIVE;
    });


    if (bookingParams.products!.length == 1)
        rec.MData.product = bookingParams.products![0];
    else {
        const pgr = recStore.dataEntityFactory(ProductGroupRecordData);
        pgr.title = "prod group";
        rec.setNewProductGroup(pgr);
    }


    if (Math.random() > 0.3)
        rec.MData.client = (await getRandomClients(1))[0];
    else {
        const cgr = recStore.dataEntityFactory<ClientGroupRecordData>(ClientGroupRecordData);
        cgr.title = "client group";
        rec.setNewClientGroup(cgr);
    }

    let res = await sg.addBooking(rec, bookingParams.products!, false);
    if (rec.Data!.productGroup) {
        const pgrec = await recStore.fetch(ProductGroupRecord, rec.Data!.productGroup!);
        await addProductsToGroup(pgrec, bookingParams.products!);
    }

    if (rec.Data!.clientGroup) {
        const cgrec = await recStore.fetch(ClientGroupRecord, rec.Data!.clientGroup!);
        const clients = await getRandomClients(Math.random() * 10);
        await addClientsToGroup(cgrec, clients);
    }

    return rec;
};



const orderCreateTask = async (size: number = 500) => {
    const PERIOD_DAYS = 31;
    const begDate = new Date();
    const endDate = Utils.addDaysToDate(begDate, PERIOD_DAYS);

    //загрузка случайных товаров
    var pv = diC.get(ProductViews);
    var products = await pv.getProductsListView(new QueryParams("id", "notActive is not true and changedAt>'2024-01-01'"));

    //загрузка случайных клиентов
    var cv = diC.get(ClientsViews);
    var clients = await cv.getClientListView(new QueryParams("id", "notActive is not true and changedAt>'2024-01-01'"));

    //загрузка случайных должностей
    var psv = diC.get(PositionsViews);
    var positions = await psv.getPositionListView(new QueryParams("id", "notActive is not true and changedAt>'2024-01-01'"));

    while (size--) {

        var obegDate = Utils.addDaysToDate(begDate, ~~(Math.random() * PERIOD_DAYS));

        var dealOrdrerArg = diC.get(AddDealOrderArgs);

        const dateString = Utils.getLocalISODateTimeWoTz(obegDate);
        dealOrdrerArg.Order.date = dateString;
        dealOrdrerArg.Order.organization="1";

        dealOrdrerArg.PriceSetup=new PriceSetup();
        dealOrdrerArg.PriceSetup.NdsRate=2000;
        dealOrdrerArg.PriceSetup.DiscountProc=500;

        var cnt = ~~(Math.random() * 4);
        while (cnt--)
            dealOrdrerArg.Clients.push(clients.getAt(~~(Math.random() * (clients.getLength() - 1)))!.id!);

        cnt = ~~(Math.random() * 4);
        while (cnt--) {
            const dealArgs = diC.get(AddDealArgs);

            dealArgs.Deal.beginDate = dateString;
            dealArgs.Deal.endDate = dateString;

            let cnt2 = ~~(Math.random() * 4);
            while (cnt2--)
                dealArgs.Positions.push(positions.getAt(~~(Math.random() * (positions.getLength() - 1)))!.id!);

            cnt2 = ~~(Math.random() * 4);
            while (cnt2--)
                dealArgs.Products.push(products.getAt(~~(Math.random() * (products.getLength() - 1)))!.id!);

            if (!dealOrdrerArg.Deals)
                dealOrdrerArg.Deals = [dealArgs];
            else
                dealOrdrerArg.Deals.push(dealArgs);
        }

        let addInfo = await DealOrderRecord.AddDealOrderRecord(diC.get("MoApiClient"), dealOrdrerArg);
    }
}



const openselect = async () => {
    let a=123456789.78;
    let b=0.01;
    let s= (a+b).toString();
let acc=0;

    for (let i = 0; i < 1000; i++) {
        acc += b;
    }
   s=acc.toString();

    debugger;
    /*
    const prov = diC.get(ProductFinderDataProvider);
    prov.init("ghhs", true);
    const res = await prov.find();
    */

    /*
    const position = new PositionList(diC, {selectStrategy:"single"});
    
    const tmpl = new SelectFormTemplate(diC, { title: "ss", componentTemplate: position });
    const MyComponent = defineComponent({
        setup: (p,c)=>tmpl.setup(p,c),
        render: tmpl.render(),
        inheritAttrs: true
    })
    openDialog(MyComponent, { title: "ss", componentTemplate: position, width: "100%", height:"100%" }, true, true, (e, d) => (e == "onBeforeClose") ? true : true)
    */
}



const clientGroupLoading = reactive({ size: 0, loading: false, recName: "client groups", createTask: clientGroupsCreateTask });
const productGroupLoading = reactive({ size: 0, loading: false, recName: "product groups", createTask: productGroupsCreateTask });
const bookingLoading = reactive({ size: 0, loading: false, recName: "booking groups", createTask: bookingCreateTask });
const scheduleGroupLoading = reactive({ size: 1, loading: false, recName: "schedule groups", createTask: scheduleCreateTask });
const orderLoading = reactive({ size: 0, loading: false, recName: "orders", createTask: orderCreateTask });

</script>