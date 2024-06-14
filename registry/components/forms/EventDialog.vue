<template>
    <v-card class="h-screen" width="730">
    <v-toolbar color="primary">
        <v-toolbar-title>{{ props.creation? 'Новая запись на ' + date : 'Запись на '+(date +" в " + start) }}</v-toolbar-title>
        <v-spacer></v-spacer>
            <v-btn icon="mdi-close" class="mt-2" @click="closeDialog"></v-btn>
    </v-toolbar>

    <div class="d-flex flex-row">
      <v-tabs v-model="tab" color="primary" direction="vertical">
        <v-tab prepend-icon="mdi-calendar-text" text="Детали записи" value="option-1"></v-tab>
        <v-tab prepend-icon="mdi-account" text="Данные клиента" value="option-2"></v-tab>
        <v-tab prepend-icon="mdi-account" text="Данные сотрудника" value="option-3"></v-tab>
      </v-tabs>
      <v-tabs-window v-model="tab" class="flex-grow-1 pa-1">
        <v-tabs-window-item value="option-1">
          <v-card flat >
            <v-card-title class="text-subtitle-1">УСЛУГИ</v-card-title>
            <v-card-text>
                <InputField custom-variant="underlined" class="w-100" :state="fieldsOptions" :type="EDataType.strictstringarray" label="Наименование" v-model="product" :items="products"/>
            </v-card-text>
            </v-card>
        <v-card flat >
            <v-card-title class="text-subtitle-1">КЛИЕНТ</v-card-title>
            <v-card-text>
                <v-combobox variant="underlined" label="ФИО, моб.телефон" v-model="client" @input="getList(client)" :items="clientArr" clearable :hide-no-data="false">
                    <template v-slot:no-data>
                        <v-list-item v-if="!clientCreationPop">
                        <v-list-item-title>
                            <v-btn class="ma-1" variant="text" @click="openClientCreator()" >Создать</v-btn>
                        </v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="clientCreationPop">
                            <v-form min-width="300" class="pa-1 bg-white elevation-3 rounded" fast-fail @submit.prevent="createNewClient()" validate-on="input">
                                <InputField :state="fieldsOptions" :type="EDataType.string" required v-model="clientSurname" :maska="fioOptions" label="Фамилия" />
                                <InputField :state="fieldsOptions" :type="EDataType.string" required v-model="clientName" :maska="fioOptions" label="Имя" />
                                <InputField :state="fieldsOptions" :type="EDataType.string" required v-model="clientPatronymic" :maska="fioOptions" label="Отчество" />
                                <InputField :state="fieldsOptions" :type="EDataType.string" required v-model="clientPhone" :maska="phoneOptions" label="Телефон" placeholder="+7(999) 999-99-99" />
                                <InputField :state="fieldsOptions" :type="EDataType.string" required v-model="clientBirthDate" label="Дата рождения"/>
                                <v-row class="pl-1">
                                    <v-checkbox v-model="clientGender" label="М" color="primary" value="m"></v-checkbox>
                                    <v-checkbox v-model="clientGender" label="Ж" color="primary" value="f"></v-checkbox>
                                </v-row>
                                <v-btn variant="text" class="mt-2" type="submit">Создать</v-btn>
                                <v-btn variant="text" class="mt-2" @click="clientCreationPopClose()">Отменить</v-btn>
                            </v-form>
                        </v-list-item>
                    </template>
                </v-combobox>
            </v-card-text>
        </v-card>
        <div class="d-flex justify-space-between mt-2">
            <v-card flat class="w-50 pb-0">
                <v-card-title class="text-subtitle-1">СОТРУДНИК</v-card-title>
                <v-card-text class="pb-0" >
                    <InputField custom-variant="plain" :state="fieldsOptions" :type="EDataType.strictstring" label="ФИО" 
                    v-model="employee" :items="props.employees"/>
                </v-card-text>
            </v-card>
            <v-card flat class="w-50 pb-0">
                <v-card-title class="text-subtitle-1">МЕСТО</v-card-title>
                <v-card-text class="d-flex justify-start pb-0" >
                    <InputField custom-variant="plain" :state="fieldsOptions" :type="EDataType.string" label="Филиал" v-model="place"/>
                    <InputField custom-variant="plain" :state="fieldsOptions" :type="EDataType.string" label="Кабинет" v-model="place"/>
                </v-card-text>
            </v-card>
        </div>
        <v-divider :thickness="3" class="mr-4" color="black" ></v-divider>
        <v-card flat >
            <v-card-title class="text-subtitle-1">ВРЕМЯ</v-card-title>
            <v-card-text class="d-flex justify-start " >
                <InputField custom-variant="plain" :state="fieldsOptions" :type="EDataType.string" label="Дата" v-model="date"/>
                <InputField custom-variant="plain" :state="fieldsOptions" :type="EDataType.string" label="Длительность" v-model="quant"/>
                <InputField custom-variant="plain" :state="fieldsOptions" :type="EDataType.string" label="Начало-окончание" v-model="startAndEnd"/>
            </v-card-text>
        </v-card>
        <v-card flat >
            <v-card-title class="text-subtitle-1">ПРИМЕЧАНИЕ <v-btn v-if="!showField" color="primary" variant="text" @click="showField = true" >ДОБАВИТЬ</v-btn> </v-card-title>
            <v-card-text class="d-flex justify-start" v-if="showField">
                <InputField v-model="inputText" custom-variant="underlined" :state="fieldsOptions" :type="EDataType.text" :focused="showField" @update:focused="checkInputLength($event)" rows="1" />
            </v-card-text>
        </v-card>
    </v-tabs-window-item>
    <v-tabs-window-item value="option-2">
        <v-card flat>
            <v-card-text>                
                <InputField :state="fieldsOptions" :type="EDataType.strictstring" prepend-icon="mdi-menu" label="Наименование" v-model="product" :items="['Первичный прием', 'Вторичный прием']"/>
            </v-card-text>
        </v-card>
    </v-tabs-window-item>
</v-tabs-window>

</div>
<v-spacer></v-spacer>
<v-card-actions>
    <v-spacer></v-spacer>
    <v-btn class="ma-1" variant="text" @click="saveChanges()">Сохранить</v-btn>
    <v-btn class="ma-1" variant="text" @click="cancelAndClose()">{{ props.creation? 'Отменить' : 'Удалить'}}</v-btn>
    <v-btn v-if="!props.creation" class="ma-1" variant="text" @click="currStatus()">Копировать</v-btn>
</v-card-actions>
</v-card>
</template>

<script setup lang="ts">
import InputField from '../InputField.vue';
import { EDataType } from '~/lib/globalTypes';
import * as Utils from '~/lib/Utils';
import { ClientsViews, type IClientListView } from '~/lib/MoApi/Views/ClientsViews';
import { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import type { ScheduleGrid, TBookingParams } from '~/lib/Booking/ScheduleGrid';
import { BookingRecord, BookingRecordData } from '~/lib/MoApi/Records/BookingRecord';
import { ClientGroupRecordData, ClientGroupRecord } from '~/lib/MoApi/Records/ClientGroupRecord';
import { ProductGroupRecordData, ProductGroupRecord } from '~/lib/MoApi/Records/ProductGroupRecord';


// import GroupEventDialog from '~~/components/forms/GroupEventDialog.vue'

let tab = ref('option-1')
const fieldsOptions = reactive({
    errCnt: 0,
    changedCnt: 0,
    readonly: false
})

const emplChoice = (split, founding) => {
  for(let i=0; i<props.employees.length; i++){
    if(props.employees[i].id == split){
      return props.employees[i][founding]
    }
  }
}

const openClientCreator = () => {
    clientCreationPop.value = true;
    if(client.value){
        let fioStr: any = Utils.normalizeFio(client.value);
        fioStr = Utils.recognizeDataInString(fioStr);
        clientSurname.value = fioStr.words[0];
        clientName.value = fioStr.words[1];
        clientPatronymic.value = fioStr.words[2];
    }
}

const currStatus = () => {
    let classes = props.event.class.split(' ');
    return classes[3]
}

// Статусы добавляются посредством добавления классов: цвета и иконки, цвет идет на [1] позиции, а иконка на [3], в будущем с API или вручную можно реализовать смену цвета
const changeStatus = (status) => {
   let classes = props.event.class.split(' ');
   classes[3] = status;
   return classes.join(" ");
}

// const openGroupDiag = () => {
//     closeDialog;
//     openDialog(GroupEventDialog, {})
// }

const checkedClient = (check) => {
    if(check == addClient){
        clientCreationPop.value = true
    } else {
        // Функция запроса данных выбранного клиента с API
    }
}
// Отмена создания нового клиента
const clientCreationPopClose = () => {
    clientCreationPop.value = false;
    client.value='';
    clientSurname.value='';
    clientName.value='';
    clientPatronymic.value='';
    clientPhone.value='';
    clientBirthDate.value='';
}

// Создание нового клиента
const createNewClient = async() => {
    client.value = Utils.makeFioStr(clientSurname.value, clientName.value, clientPatronymic.value) +' '+ clientPhone.value;
    changedEvent.value.title = client.value;
    // Запрос на API создание нового клиента
    clientCreationPop.value = false;
}

const findEmployeeById = (id: string) => {
    return props.employees.find(employee => employee.id === id);
}

interface Props {
    event: any,
    employees: any[],
    products: any[],
    status: any,
    creation: boolean,
    delFunc: Function,
    mainAction: Function
}
const iocc = useContainer();
const recStore = iocc.get(RecordsStore);
const clienView = iocc.get(ClientsViews);
 const props = defineProps<Props> ()
 let availableTimeSlots = ref<any>([])
 let clientName = ref()
 let clientSurname = ref()
 let clientPatronymic = ref()
 let clientPhone = ref()
 let clientEmail = ref()
 let clientBirthDate = ref()
 let clientCreationPop = ref(false)
 let clientGender = ref()
 let addClient = 'Добавить клиента'
 let clientArr = ref<any[]>([])
 let client = ref(props.event.title? props.event.title : '')
 let employee = ref(findEmployeeById(props.event.split))
 let speciality = ref(emplChoice(props.event.split, 'specialist'))
 let product = ref()
 let products = ref(props.products)
 let place = ref()
 let status = ref(currStatus())//Статус приходит с API, по названию статуса проходимся по массиву с иконками и берем иконку соответсвующую названию, добавляем иконку в класс события
 let evTitle= ref(props.event.title)
 let start = ref(props.event.start!.formatTime())
 let end = ref(props.event.end!.formatTime())
 let quant = ref(props.event.duration? props.event.duration : props.event.endTimeMinutes - props.event.startTimeMinutes)
let startAndEnd = ref(start.value + '-' + end.value)
let date = ref(props.event.start!.toLocaleDateString())
let showField = ref(false)
let inputText = ref('')
let inputFocus = ref()

let changedEvent = ref({
    title: client.value,
    employee: employee.value,
    speciality: speciality.value,
    class: props.event.class,
 })

const cancelAndClose = () => {
    props.delFunc();
    closeDialog('');
}

const saveChanges = () => {
    props.mainAction(changedEvent.value);
    closeDialog('');
}

const checkInputLength = (e) => {
    console.log(e)
    if (inputText.value.length === 0) {
          showField.value = false;
        } 
};

let timerId : NodeJS.Timeout | undefined;
const getList = async (text: string, ...args: any[]) => {
    let whereArr: string[] = [];
    let str = Utils.normalizeFio(text);
    
    clearTimeout(timerId);
    
    const delayedReq = async () => {        
        if (str) {
            let recdata = Utils.recognizeDataInString(str);
            let fioArr = recdata.words;
            let phone = recdata.phone;

            if(fioArr.length){
                fioArr[fioArr.length - 1] += '%';
                whereArr.push(`surname like '${fioArr[0]}'`);
                if (fioArr[1]) whereArr.push(`name like '${fioArr[1]}'`);
                if (fioArr[2]) whereArr.push(`patronymic like '${fioArr[2]}'`);
            }
            // if (date){
            //     whereArr.push(`birthdate= '${date.toISOString()}'`);
            // }
            if (phone){
                whereArr.push(`mainphone= '${phone}'`);
            }
            let rdl = await clienView.getClientListView({ select: "id,name,surname,patronymic,birthdate,mainPhone", where: whereArr.join(" and "), limit: 10 })
            let res = rdl.toArray().map((item) => { return { value: item.id, title: Utils.makeFioStr(item.surname, item.name, item.patronymic) +' '+item.mainPhone, birthdate: item.birthdate, phone: item.mainPhone }});
            clientArr.value = res.sort((a, b) => a.title.localeCompare(b.title));
        }
    }

    timerId = setTimeout(delayedReq, 1500)

}

const createBooking = async (sg: ScheduleGrid, date: Date, bookingParams: TBookingParams) => {

    let rec = await recStore.createNew<BookingRecord, BookingRecordData>(BookingRecord, d => {
        d.beginDate = Utils.getLocalISODateTimeWoTz(date);
        d.duration = bookingParams.duration;
        d.position = bookingParams.position || null;
        d.division = bookingParams.division || null;
        d.placement = bookingParams.placement || null;
        d.status= 1;
    });

    let res = await sg.addBooking(rec, bookingParams.products!, false);

return rec;
};


let translit = (word) => {
   const converter = {
     'a': 'ф', 'b': 'и', 'v': 'м', 'g': 'п', 'd': 'в',
     'e': 'у', 'z': 'я', 'i': 'ш', 'y': 'н', 'k': 'л',
     'l': 'д', 'm': 'ь', 'n': 'т', 'o': 'щ', 'p': 'з',
     'r': 'к', 's': 'ы', 't': 'е', 'u': 'г', 'f': 'а',
     'h': 'р', 'c': 'с', 'j': 'о', 'w': 'ц', ';': 'ж',
     "'": 'э', ',': 'б', "x": "ч", 'q': 'й', '.': 'ю'
   };
 
   for (const [key, value] of Object.entries(converter)) {
     word = word.replaceAll(key, value);
   }
 
   return word;
}

const phoneOptions = {
  mask: "+7(###) ###-##-##"
}

const fioOptions = {
  mask: "Aa",
  tokens: {
    A:{pattern: /[A-я;,.']/},
    a:{pattern: /[a-я;,.']/, multiple: true}
  }
}
</script>