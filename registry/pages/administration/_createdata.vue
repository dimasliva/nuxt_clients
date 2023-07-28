<template>
    <VRow class="ml-4">
        <VCol style="max-width: 150px;">
            <v-text-field v-model="emplLoading.size" variant="underlined" label="Сотрудники" hide-details="auto" />
            <v-btn :loading="emplLoading.loading" type="submit" @click="createRecs(emplLoading)">Создать</v-btn>
        </VCol>

        <VCol style="max-width: 150px;">
            <v-text-field v-model="clientsLoading.size" variant="underlined" label="Клиенты" hide-details="auto" />
            <v-btn :loading="clientsLoading.loading" type="submit" @click="createRecs(clientsLoading)">
                Создать
                <template v-slot:loader>
                    <v-progress-linear absolute height="7" indeterminate></v-progress-linear>
                </template>
            </v-btn>
        </VCol>

    </VRow>
</template>

<script setup lang="ts">
import { EmployeeRecord, IEmployeeRecordData } from '~~/lib/MoApi/Records/EmployeeRecord';
import { EmployeeContactsRecord, IEmployeeContactsRecordData } from '~~/lib/MoApi/Records/EmployeeContactsRecord';
import { MoApiClient } from '~~/lib/MoApi/MoApiClient';
import { RecordsStore } from '~~/lib/MoApi/Records/RecordsStore';
import { QueryParams } from '~~/lib/MoApi/RequestArgs';
import { PageMap } from 'lib/PageMap';
import { ClientRecord, IClientRecordData } from '~~/lib/MoApi/Records/ClientRecord';
import { ClientContactsRecord } from '~~/lib/MoApi/Records/ClientContactsRecord';


const iocc = useContainer();
const apiClient = iocc.get<MoApiClient>("MoApiClient");
const pageMap = iocc.get<PageMap>("PageMap");
const recStore = iocc.get(RecordsStore);


const numClients = ref(0);
const numEmployees = ref(0);





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





const genders = ["m", "f"];
const namesM = ["Иван", "Петр", "Сергей", "Андрей", "Дмитрий", "Александр", "Михаил", "Николай", "Владимир", "Олег", "Артем", "Алексей", "Константин", "Виктор", "Геннадий", "Григорий", "Евгений", "Егор", "Захар", "Игорь", "Кирилл", "Леонид", "Максим", "Роман", "Руслан", "Семен", "Станислав", "Тимофей", "Федор", "Юрий", "Ярослав"];
const namesF = ["Анастасия", "Александра", "Алина", "Анна", "Валерия", "Виктория", "Галина", "Дарья", "Екатерина", "Елена", "Ирина", "Карина", "Кристина", "Лариса", "Любовь", "Маргарита", "Марина", "Надежда", "Наталья", "Оксана", "Ольга", "Полина", "Светлана", "Татьяна", "Ульяна", "Юлия"];
const surnamesM = ["Иванов", "Петров", "Сидоров", "Кузнецов", "Смирнов", "Михайлов", "Федоров", "Соколов", "Новиков", "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов", "Егоров", "Павлов", "Козлов", "Степанов", "Николаев", "Орлов", "Андреев", "Макаров", "Никитин", "Захаров", "Зайцев", "Соловьев", "Борисов", "Яковлев", "Григорьев", "Романов", "Воробьев"];
const surnamesF = ["Сергеева", "Кузьмина", "Новикова", "Морозова", "Волкова", "Алексеева", "Лебедева", "Семенова", "Егорова", "Павлова", "Козлова", "Степанова", "Николаева", "Орлова", "Андреева", "Макарова", "Никитина", "Захарова", "Зайцева", "Соловьева", "Борисова", "Яковлева", "Григорьева", "Романова", "Воробьева"]
const patronymicsM = ["Иванович", "Петрович", "Сергеевич", "Андреевич", "Дмитриевич", "Александрович", "Михайлович", "Николаевич", "Владимирович", "Олегович", "Артемович", "Алексеевич", "Константинович", "Викторович", "Геннадьевич", "Григорьевич", "Евгеньевич", "Егорович", "Захарович", "Игоревич", "Кириллович", "Леонидович", "Максимович", "Романович", "Русланович", "Семенович", "Станиславович", "Тимофеевич", "Федорович", "Юрьевич", "Ярославович"];
const patronymicsF = ["Ивановна", "Петровна", "Сергеевна", "Андреевна", "Дмитриевна", "Александровна", "Михайловна", "Николаевна", "Владимировна", "Олеговна", "Артемовна", "Алексеевна", "Константиновна", "Викторовна", "Геннадьевна", "Григорьевна", "Евгеньевна", "Егоровна", "Захаровна", "Игоревна", "Кирилловна", "Леонидовна", "Максимовна", "Романовна", "Руслановна", "Семеновна", "Станиславовна", "Тимофеевна", "Федоровна", "Юрьевна", "Ярославовна"]



const addEmployee = async (name: string, surname: string, patronymic: string, gender: string, birthdate: string, phone?: string, mail?: string) => {
    let rec = await recStore.createNew<EmployeeRecord, IEmployeeRecordData>(EmployeeRecord, (data) => {
        data.name = name;
        data.surname = surname;
        data.patronymic = patronymic;
        data.gender = gender;
        data.birthdate = "2023-05-25T05:12:08.774Z";
        data.roles = "admin";
    })

    let emplcont = await recStore.getOrCreate(EmployeeContactsRecord, rec.Key);
    emplcont.Data!.mainEmail = mail || null;
    emplcont.Data!.mainPhone = phone || null;
    emplcont.save();
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
        //console.log(name, surname, patronymic, gender, birthdate);
        await addEmployee(name, surname, patronymic, gender, birthdate, generatePhoneNumber(), generateEmailAddress());
    }
}


const addClient = async (name: string, surname: string, patronymic: string, gender: string, birthdate: string, phone?: string, mail?: string) => {
    let rec = await recStore.createNew<ClientRecord, IClientRecordData>(ClientRecord, (data) => {
        data.name = name;
        data.surname = surname;
        data.patronymic = patronymic;
        data.gender = gender;
        data.birthdate = generateRandomDate();
    })

    let reccont = await recStore.getOrCreate(ClientContactsRecord, rec.Key);
    reccont.Data!.mainEmail = mail || null;
    reccont.Data!.mainPhone = phone || null;
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
        //console.log(name, surname, patronymic, gender, birthdate);
        await addClient(name, surname, patronymic, gender, birthdate, generatePhoneNumber(), generateEmailAddress());
    }
}



const emplLoading = reactive({ size: 0, loading: false, recName: "employees", createTask: emplCreateTask });
const clientsLoading = reactive({ size: 0, loading: false, recName: "clients", createTask: clientsCreateTask });



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
    return randomDate.toISOString();
}
</script>