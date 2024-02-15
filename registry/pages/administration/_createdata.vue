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
        <VCol style="max-width: 300px;">
            <v-text-field v-model="emplLoading.size" variant="underlined" label="Сотрудники" hide-details="auto" />
            <v-text-field v-model="scheduleItemGroup" variant="underlined" label="Название раздела расписания"
                hide-details="auto" />
            <v-btn :loading="emplLoading.loading" type="submit" @click="createRecs(emplLoading)">Создать</v-btn>
        </VCol>
        <VCol style="max-width: 300px;">
            <v-text-field v-model="productsCatalogName" variant="underlined" label="Название прайса" hide-details="auto" />
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
    </VRow>
</template>

<script setup lang="ts">
import { EmployeeRecord, EmployeeRecordData } from '~~/lib/MoApi/Records/EmployeeRecord';
import { EmployeeContactsRecord } from '~~/lib/MoApi/Records/EmployeeContactsRecord';
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


const iocc = useContainer();
const recStore = iocc.get(RecordsStore);


let productsCatalogSectionQuantity = ref(0)
let productsCatalogName = ref('')
let scheduleItemGroup = ref('')
let scheduleItemGroupLoader = ref(false)



const createRecs = async (recLoading: typeof emplLoading) => {

    const size = recLoading.size;
    const recCreateTask = recLoading.createTask;
    if (productsCatalogName.value && productsCatalogSectionQuantity.value && priceListLoading.size) { await addProductsCatalog(productsCatalogName.value) };
    if (scheduleItemGroup.value) { await addScheduleItemGroup() };

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





const genders = ["m", "f"];
const namesM = ["Иван", "Петр", "Сергей", "Андрей", "Дмитрий", "Александр", "Михаил", "Николай", "Владимир", "Олег", "Артем", "Алексей", "Константин", "Виктор", "Геннадий", "Григорий", "Евгений", "Егор", "Захар", "Игорь", "Кирилл", "Леонид", "Максим", "Роман", "Руслан", "Семен", "Станислав", "Тимофей", "Федор", "Юрий", "Ярослав"];
const namesF = ["Анастасия", "Александра", "Алина", "Анна", "Валерия", "Виктория", "Галина", "Дарья", "Екатерина", "Елена", "Ирина", "Карина", "Кристина", "Лариса", "Любовь", "Маргарита", "Марина", "Надежда", "Наталья", "Оксана", "Ольга", "Полина", "Светлана", "Татьяна", "Ульяна", "Юлия"];
const surnamesM = ["Иванов", "Петров", "Сидоров", "Кузнецов", "Смирнов", "Михайлов", "Федоров", "Соколов", "Новиков", "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов", "Егоров", "Павлов", "Козлов", "Степанов", "Николаев", "Орлов", "Андреев", "Макаров", "Никитин", "Захаров", "Зайцев", "Соловьев", "Борисов", "Яковлев", "Григорьев", "Романов", "Воробьев"];
const surnamesF = ["Сергеева", "Кузьмина", "Новикова", "Морозова", "Волкова", "Алексеева", "Лебедева", "Семенова", "Егорова", "Павлова", "Козлова", "Степанова", "Николаева", "Орлова", "Андреева", "Макарова", "Никитина", "Захарова", "Зайцева", "Соловьева", "Борисова", "Яковлева", "Григорьева", "Романова", "Воробьева"]
const patronymicsM = ["Иванович", "Петрович", "Сергеевич", "Андреевич", "Дмитриевич", "Александрович", "Михайлович", "Николаевич", "Владимирович", "Олегович", "Артемович", "Алексеевич", "Константинович", "Викторович", "Геннадьевич", "Григорьевич", "Евгеньевич", "Егорович", "Захарович", "Игоревич", "Кириллович", "Леонидович", "Максимович", "Романович", "Русланович", "Семенович", "Станиславович", "Тимофеевич", "Федорович", "Юрьевич", "Ярославович"];
const patronymicsF = ["Ивановна", "Петровна", "Сергеевна", "Андреевна", "Дмитриевна", "Александровна", "Михайловна", "Николаевна", "Владимировна", "Олеговна", "Артемовна", "Алексеевна", "Константиновна", "Викторовна", "Геннадьевна", "Григорьевна", "Евгеньевна", "Егоровна", "Захаровна", "Игоревна", "Кирилловна", "Леонидовна", "Максимовна", "Романовна", "Руслановна", "Семеновна", "Станиславовна", "Тимофеевна", "Федоровна", "Юрьевна", "Ярославовна"]

const pricesA = ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2500', '3000', '3500', '4000', '4500', '5000', '6000', '7000', '8000', '10000',];

const fullTitles = ProductTitles;
const durations = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 80, 90, 120];
let scheduleGroupRec = ref();
let tempProdRecArr = ref<any>([])

const addEmployee = async (name: string, surname: string, patronymic: string, gender: string, birthdate: string, phone?: string, mail?: string) => {
    let rec = await recStore.createNew<EmployeeRecord, EmployeeRecordData>(EmployeeRecord, (data) => {
        data.name = name;
        data.surname = surname;
        data.patronymic = patronymic;
        data.gender = gender;
        data.birthdate = "2023-05-25T05:12:08.774Z";
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

        await addPosition(emplkey, i); //2
    }
}


const addPosition = async (emplkey, i) => {
    let rec = await recStore.createNew<PositionRecord, PositionRecordData>(PositionRecord, (data) => {
        data.employee = emplkey;
        data.position = positionDictCodes[Math.floor(Math.random() * positionDictCodes.length - 1)]!;
    });
    await rec.save();
    await addScheduleItem(rec.Key, i); //3
};

const timeSpansCrtr = () => {
    let a: any = [];
    for (let i = 0; i < Math.floor(Math.random() * (20 - 2) + 2); i++) {
        a.push({
            "time": Math.floor(Math.random() * (144 - 36) + 1) * 10,
            "duration": Math.floor(Math.random() * (12 - 1) + 1) * 10,
            "type": 1,
        })
    }
    return a
}

let recCode = ref(0);
let key = ref('')
const addScheduleItem = async (positionKey, i) => {
    let rec = await recStore.createNew<ScheduleItemRecord, ScheduleItemData>(ScheduleItemRecord, (data) => {
        data.position = positionKey;
        data.beginDate = new Date().toISOString().slice(0, 10);
        data.endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);
        data.activityDays = Math.floor(Math.random() * (8 - 3) + 3);
        data.pauseDays = 7 - data.activityDays;
        data.exceptions = new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * (365 - 2) + 2))).toLocaleDateString().slice(0, 5);
        data.workExceptions = new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * (365 - 2) + 2))).toLocaleDateString().slice(0, 5);
        data.timespans = timeSpansCrtr();
    });
    await rec.save();
    recCode.value = rec.RecCode;
    key.value = rec.Key;
    scheduleGroupRec.value.addCoupling(key.value, recCode.value)
    rec.addChild(tempProdRecArr.value[i], 1024, 0)
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
    productsCreateTask(priceListLoading.size, recSection.Key);
}

const productsCreateTask = async (size: number, key) => {
    for (let i = 0; i < size; i++) {
        currElement.value == fullTitles.length ? currElement.value = 0 : currElement.value++;
        let title: any = fullTitles[currElement.value];
        let fullTitle: any = title;
        let code: any = generateUniqueStrings(1, 1);
        let productsCatalog = catalogKey.value;
        let productsCatalogSection = key;
        let prices = pricesA[Math.floor(Math.random() * pricesA.length)];
        let duration = durations[Math.floor(Math.random() * durations.length)];
        let comments: any = generateUniqueStrings(1, 3);
        await addProducts(title, fullTitle, code, productsCatalog, productsCatalogSection, prices, duration, comments);
    }
}

const addProducts = async (title: string, fullTitle: string, code: string, productsCatalog: string, productsCatalogSection: string, prices: string, duration: number, comments: string) => {
    let rec = await recStore.createNew<ProductRecord, ProductRecordData>(ProductRecord, (data) => {
        data.title = title;
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
    // почему не работает родительство
}

const emplLoading = reactive({ size: 0, loading: false, recName: "employees", createTask: emplCreateTask });
const clientsLoading = reactive({ size: 0, loading: false, recName: "clients", createTask: clientsCreateTask });
const priceListLoading = reactive({ size: 0, loading: false, recName: "products", createTask: productsCreateTask });

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
    return Array.from(uniqueStrings)[0];
}


const positionDictCodes = [
    1048910, 1048911, 1049003, 1049004, 1048912, 1048913, 1049005, 1049006, 1049007, 1049008, 1049009, 1049010, 1049011, 1049012, 1049013, 1049014, 1049098, 1049099, 1049100, 1049091, 1049090,
    1049089, 1049096, 1049097, 1049101, 1048916, 1048917, 1048918, 1048919, 1048920, 1048921, 1048587, 1048589, 1048590, 1048591, 1048592];
</script>