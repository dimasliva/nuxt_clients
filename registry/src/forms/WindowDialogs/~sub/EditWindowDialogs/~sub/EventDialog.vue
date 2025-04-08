<template>
  <FormsEditWindowDialog :title="props.creation ? 'Новая запись на ' + date : 'Запись на ' + (date + ' в ' + start)"
                         :on-save="saveChanges" :on-close=" () => {created ? closeDialog(props.event) : closeDialog('')}" :readonly="false">
    <template #default="{ fieldsOptions }">
    <div class="d-flex flex-row pa-0">
      <v-tabs v-model="tab" color="primary" direction="vertical">
        <v-tab prepend-icon="mdi-calendar-text" text="Детали записи" value="option-1"></v-tab>
        <v-tab prepend-icon="mdi-account" text="Данные клиента" value="option-2"></v-tab>
        <v-tab prepend-icon="mdi-account" text="Данные сотрудника" value="option-3"></v-tab>
      </v-tabs>
      <v-tabs-window v-model="tab" class="flex-grow-1 pa-1">
        <v-tabs-window-item value="option-1">
          <v-card flat>

            <v-card-title class="text-subtitle-1">УСЛУГИ</v-card-title>
            <v-card-text>
              <InputField custom-variant="underlined" class="w-100" :state="fieldsOptions"
                          @update:model-value="onProductsChange($event)" required
                          :type="EDataType.strictstringarray" label="Наименование" v-model="product" :items="products"
                          return-object/>
            </v-card-text>
          </v-card>
          <v-card flat>
            <v-card-title class="text-subtitle-1">КЛИЕНТ</v-card-title>
            <v-card-text>
              <v-combobox variant="underlined" :state="fieldsOptions" v-model="client" @input="getList(<string>client)"
                          :items="clientArr" clearable :hide-no-data="false" :rules="[v => (!v ? (fieldsOptions.errCnt++, '') : (fieldsOptions.errCnt > 0 && fieldsOptions.errCnt--, !!v || ''))]">
                <template v-slot:label>
                  <span>
                      {{ "ФИО, моб.телефон" }} <span class="text-error">*</span>
                  </span>
                </template>
                <template v-slot:no-data>
                  <v-list-item v-if="!clientCreationPop">
                    <v-list-item-title>
                      <v-btn class="ma-1" variant="text" @click="openClientCreator()">Создать</v-btn>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="clientCreationPop">
                    <v-form min-width="300" class="pa-1 bg-white elevation-3 rounded" fast-fail
                            @submit.prevent="createNewClient()" validate-on="input">
                      <InputField :state="fieldsOptions" :type="EDataType.string" required v-model="clientSurname"
                                  :maska="fioOptions" label="Фамилия"/>
                      <InputField :state="fieldsOptions" :type="EDataType.string" required v-model="clientName"
                                  :maska="fioOptions" label="Имя"/>
                      <InputField :state="fieldsOptions" :type="EDataType.string" required v-model="clientPatronymic"
                                  :maska="fioOptions" label="Отчество"/>
                      <InputField :state="fieldsOptions" :type="EDataType.string" required v-model="clientPhone"
                                  :maska="phoneOptions" label="Телефон" placeholder="+7(999) 999-99-99"/>
                      <InputField :state="fieldsOptions" :type="EDataType.string" required v-model="clientBirthDate"
                                  label="Дата рождения"/>
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
              <v-card-text class="pb-0">
                <InputField custom-variant="plain" :state="fieldsOptions" :type="EDataType.string" label="ФИО"
                            v-model="employee.label" readonly required/>
              </v-card-text>
            </v-card>
            <v-card flat class="w-50 pb-0">
              <v-card-title class="text-subtitle-1">МЕСТО</v-card-title>
              <v-card-text class="d-flex justify-start pb-0">
                <InputField custom-variant="plain" :state="fieldsOptions" :type="EDataType.string" label="Филиал"
                            v-model="division" readonly />
                <InputField custom-variant="plain" :state="fieldsOptions" :type="EDataType.string" label="Кабинет"
                            v-model="placement" readonly />
              </v-card-text>
            </v-card>
          </div>
          <v-divider :thickness="3" class="mr-4" color="black"></v-divider>
          <v-card flat>
            <v-card-title class="text-subtitle-1">ВРЕМЯ</v-card-title>
            <v-card-text class="d-flex justify-start ">
              <InputField custom-variant="plain" :state="fieldsOptions" :type="EDataType.string" label="Дата"
                          v-model="date" readonly required/>
              <InputField custom-variant="plain" :state="fieldsOptions" :type="EDataType.string" label="Длительность"
                          v-model="duration" readonly required/>
              <InputField custom-variant="plain" :state="fieldsOptions" :type="EDataType.string"
                          label="Начало-окончание" v-model="startAndEnd" readonly required/>
              <v-btn v-if="!props.creation" color="primary" variant="text" @click="useQuick()">
                {{ showQuicks ? 'ОТМЕНА' : 'ИЗМЕНИТЬ' }}
              </v-btn>
            </v-card-text>
          </v-card>
          <QuickTimeOffer v-if="showQuicks" :schedule-data="availableTimesArr"
                          @selected-slot="updBookingTime($event)"></QuickTimeOffer>
          <v-card flat>
            <v-card-title class="text-subtitle-1">ПРИМЕЧАНИЕ
              <v-btn v-if="!addDescr" color="primary" variant="text" @click="addDescr = true">ДОБАВИТЬ</v-btn>
            </v-card-title>
            <v-card-text class="d-flex justify-start" v-if="addDescr">
              <InputField v-model="inputText" custom-variant="underlined" :state="fieldsOptions" :type="EDataType.text"
                          :focused="addDescr" @update:focused="checkInputLength($event)" rows="1"/>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
        <v-tabs-window-item value="option-2">
          <v-card flat>
            <v-card-text>
              <InputField :state="fieldsOptions" :type="EDataType.strictstring" prepend-icon="mdi-menu"
                          label="Наименование" v-model="product" :items="['Первичный прием', 'Вторичный прием']"/>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>

    </div>
    </template>
  </FormsEditWindowDialog>
</template>

<script setup lang="ts">
// @ts-nocheck
import InputField from '~uibase/components/InputField.vue';
import {EDataType} from '~/src/common/lib/globalTypes';
import * as Utils from '~/src/common/lib/Utils';
import {ClientsViews, type IClientListView} from '~/src/common/lib/MoApi/Views/ClientsViews';
import {RecordsStore} from '~/src/common/lib/MoApi/Records/RecordsStore';
import {ScheduleGrid, ScheduleGridOptions, type TBookingParams} from '~/src/common/lib/Booking/ScheduleGrid';
import {BookingRecord, BookingRecordData} from '~/src/common/lib/MoApi/Records/BookingRecord';
import {ClientGroupRecordData, ClientGroupRecord} from '~/src/common/lib/MoApi/Records/ClientGroupRecord';
import {ProductGroupRecordData, ProductGroupRecord} from '~/src/common/lib/MoApi/Records/ProductGroupRecord';
import {EEmployeeTimeTypes} from '~/src/common/lib/MoApi/Records/DataEntities/ScheduleTimeSpanEntity';
import {ProductRecord} from '~/src/common/lib/MoApi/Records/ProductRecord';
import QuickTimeOffer from "~/src/components/QuickTimeOffer.vue";
import type {Scheduler} from "~/src/components/CustomMonthView/scheduler";
import type {ScheduleEvent} from "~/src/components/CustomMonthView/SchedulerTypes";
import {Bookings} from "~/src/common/lib/Booking/Bookings";
import {useDelQU} from "~/src/common/composables/useActionDialog";

let tab = ref('option-1')

const emplChoice = (positions, employee) => {
  return positions.find((pos) => pos.employee == employee).id;

}

const openClientCreator = () => {
  clientCreationPop.value = true;
  if (client.value) {
    let fioStr: any = Utils.normalizeFio(<string>client.value);
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
  if (check == addClient) {
    clientCreationPop.value = true
  } else {
    // Функция запроса данных выбранного клиента с API
  }
}

// Отмена создания нового клиента

const clientCreationPopClose = () => {
  clientCreationPop.value = false;
  client.value = '';
  clientSurname.value = '';
  clientName.value = '';
  clientPatronymic.value = '';
  clientPhone.value = '';
  clientBirthDate.value = '';
}
// Создание нового клиента

const createNewClient = async () => {
  client.value = Utils.makeFioStr(clientSurname.value, clientName.value, clientPatronymic.value) + ' ' + clientPhone.value;
  changedEvent.value.title = client.value;
  // Запрос на API создание нового клиента
  clientCreationPop.value = false;
}
const findEmployeeById = (id: string) => {
  return props.scheduler.empArr.find(employee => employee.id === id);
}

interface Props {
  event: any,
  schGrid: { start: any, end: any },
  scheduler: Scheduler,
  products: any[],
  status: any,
  creation: boolean,
  delFunc?: Function,
  mainAction: Function,
  clientData?: { id: string, name: string, surname: string, patronymic: string, phone: string }
}

const iocc = useContainer();

const recStore = iocc.get(RecordsStore);
const clientView = iocc.get(ClientsViews);
const props = defineProps<Props>()
let availableTimeSlots = ref<any>([])
let clientName = ref(props.clientData ? props.clientData.name : '')
let clientSurname = ref(props.clientData ? props.clientData.surname : '')
let clientPatronymic = ref(props.clientData ? props.clientData.patronymic : '')
let clientPhone = ref(props.clientData ? props.clientData.phone : '')
let clientEmail = ref()
let clientBirthDate = ref()
let clientCreationPop = ref(false)
let clientGender = ref()
let addClient = 'Добавить клиента'
let clientArr = ref<any[]>([])
let client = ref<string | null | Client>(props.creation ? null : Utils.makeFioStr(clientSurname.value, clientName.value, clientPatronymic.value) + ' ' + clientPhone.value)
let employee = ref(findEmployeeById(props.event.split))
let position = ref(emplChoice(props.scheduler.positions, props.event.split))
let product = ref(props.creation ? (props.products.length == 1 || props.event.quick ? [props.products[0]] : null) : props.event.products.map(id => props.products.find(prod => id == prod.id)))
let products = ref(props.products)
let placement = ref()
let division = ref()
let status = ref(currStatus())//Статус приходит с API, по названию статуса проходимся по массиву с иконками и берем иконку соответсвующую названию, добавляем иконку в класс события
let evTitle = ref(props.event.title)
let duration = ref(props.creation ? (product.value ? product.value[0].duration : 0) : props.event.duration)
let start = ref<number>(props.event.start!.formatTime())
let end = ref<number>(new Date(new Date(props.event.start).getTime() + duration.value * 60000).formatTime())
let startAndEnd = ref(start.value && end.value ? start.value + '-' + end.value : "-")
let date = ref(props.event.start!.toLocaleDateString())
let addDescr = ref(false)
let showQuicks = ref(false)
let inputText = ref('')
let inputFocus = ref()
let timerId: NodeJS.Timeout | undefined;
let scheduler = props.scheduler;
let availableTimesArr = ref<ScheduleEvent[]>([])
let changedEvent = ref({
  title: clientSurname.value + ' ' + clientName.value,
  employee: employee.value,
  position: position.value,
  class: props.event.class,
})
let created = ref(false)

const onProductsChange = (prs) => {
  console.log(prs)
  if (prs.length == 0) {
    duration.value = 0
  } else if (prs.length > 1) {
    duration.value = prs.reduce((acc, prod) => acc + prod.duration, 0)
  } else {
    duration.value = prs[0].duration
  }
  end.value = new Date(new Date(props.event.start).getTime() + duration.value * 60000).formatTime()
  startAndEnd.value = start.value + '-' + end.value

}

const deleteRecord = async () => {
  let choice = await useDelQU("Удалить эту запись?")
  if (!props.creation && choice) {
    const bkRec = await recStore.get<BookingRecord>(BookingRecord, props.event.id)
    let res = await bkRec.delete();
    if (res) {
      props.event.deleting = true;
      closeDialog(props.event);
    }
  }
}


const saveChanges = async () => {
  if (props.creation) {
    let rec = await createRec();
    let clientTitle = client.value!.title.split(' ');
    let timeStart = new Date(props.event.start.format('YYYY-MM-DD') + " " + start.value);
    let timeEnd = new Date(props.event.start.format('YYYY-MM-DD') + " " + end.value);
    let startMinutes = start.value.split(':')
    startMinutes = startMinutes[0] * 60 + startMinutes[1] * 1;
    let endMinutes = end.value.split(':')

    endMinutes = endMinutes[0] * 60 + endMinutes[1] * 1;
    if (rec) {
      created.value = true
      props.event.start = timeStart;
      props.event.end = timeEnd;
      props.event.title = clientTitle[0] + " " + clientTitle[1];
      props.event.duration = duration.value;
      props.event.startTimeMinutes = startMinutes;
      props.event.endTimeMinutes = endMinutes;
      props.event.class = 'ordered';
      props.event.content = product.value.map(pr => pr.title).toString();
      props.event.products = product.value.map(el => el.id);
      props.event.id = rec.MData.id;
      props.event.client = {
        id: rec.MData.client,
        name: clientTitle[1],
        surname: clientTitle[0],
        patronymic: clientTitle[2],
        phone: clientPhone.value
      }
      props.event.status = rec.MData.status
    }
  } else {
    await updateRec()

  }
}

const checkInputLength = (e) => {
  if (inputText.value.length === 0) {
    addDescr.value = false;
  }

};

const getList = async (text: string, ...args: any[]) => {
  let whereArr: string[] = [];
  let str = Utils.normalizeFio(text);

  clearTimeout(timerId);

  const delayedReq = async () => {
    if (str) {
      let recdata = Utils.recognizeDataInString(str);
      let fioArr = recdata.words;
      let phone = recdata.phone;

      if (fioArr.length) {
        fioArr[fioArr.length - 1] += '%';
        whereArr.push(`surname like '${fioArr[0]}'`);
        if (fioArr[1]) whereArr.push(`name like '${fioArr[1]}'`);
        if (fioArr[2]) whereArr.push(`patronymic like '${fioArr[2]}'`);
      }
      // if (date){
      //     whereArr.push(`birthdate= '${date.toISOString()}'`);
      // }
      if (phone) {
        whereArr.push(`mainphone= '${phone}'`);
      }
      let rdl = await clientView.getClientListView({
        select: "id,name,surname,patronymic,birthdate,mainPhone",
        where: whereArr.join(" and "),
        limit: 10
      })
      let res = rdl.toArray().map((item) => {
        return {
          value: item.id,
          title: Utils.makeFioStr(item.surname, item.name, item.patronymic) + ' ' + item.mainPhone,
          birthdate: item.birthdate,
          phone: item.mainPhone
        }
      });
      clientArr.value = res.sort((a, b) => a.title.localeCompare(b.title));
    }
  }

  timerId = setTimeout(delayedReq, 1500)

}

const addProductsToGroup = async (rec: ProductGroupRecord, products: string[]) => {
  var promises: Promise<void>[] = [];
  for (let y = 0; y < products.length; y++) {
    promises.push(rec.addCoupling(products[y].id, ProductRecord.RecCode));
  }
  await Promise.all(promises);
}

const addProductGroup = async () => {
  let rec = await recStore.createNew<ProductGroupRecord, ProductGroupRecordData>(ProductGroupRecord, (data) => {
    data.title = product.value.map(product => product.title).join(', ');
  })
  await rec.save();

  return rec;
}

const updateRec = async (date?) => {

  let updRec = await recStore.fetch<BookingRecord>(BookingRecord, props.event.id)

  console.log(updRec)

  if (product.value.length == 1) {
    updRec.MData.product = product.value[0].id;
    updRec.MData.duration = duration.value;
    props.event.products = product.value[0].id
    props.event.duration = duration.value;
  } else {
    updRec.MData.product = null;

    let rec = await addProductGroup();
    await addProductsToGroup(rec, product.value);
    updRec.MData.productGroup = rec.MData.id
  }

  if (date) {
    updRec.MData.beginDate = date
  }

  let res = await updRec.save()
  console.log(res)
}

const createRec = async () => {
  const positions = props.scheduler.positions.map(pos => pos.id)
  const schGrid = iocc.get(ScheduleGrid);
  const opts = new ScheduleGridOptions(props.schGrid.start, props.schGrid.end, positions);

  await schGrid.init(opts)

  let rec = await recStore.createNew<BookingRecord, BookingRecordData>(BookingRecord, d => {
    d.beginDate = Utils.getLocalISODateTimeWoTz(props.event.start);
    d.duration = duration.value;
    d.position = position.value || null;
    d.division = division.value || null;
    d.placement = placement.value || null;
    d.status = 1;
  });

  rec.MData.client = client.value.value

  if (product.value.length == 1) {
    rec.MData.product = product.value[0].id;
  } else {
    const pgr = recStore.dataEntityFactory(ProductGroupRecordData);
    pgr.title = "prod group";
    rec.setNewProductGroup(pgr);
  }

  let res = await schGrid.addBooking(rec, product.value, false);

  if (res) {
    return rec;
  } else {
    return false
  }
};

const useQuick = async () => {
  if (!showQuicks.value) {
    await findFreeTime()
    showQuicks.value = !showQuicks.value
  }
}

const findFreeTime = async () => {
  let reqProds = product.value.map(pr => pr.id)
  await scheduler.getScheduler(props.schGrid.start.format('YYYY-MM-DD'), props.schGrid.end.format('YYYY-MM-DD'), null, reqProds);
  let newEndDate = new Date(props.schGrid.start.getTime());
  newEndDate.setDate(newEndDate.getDate() + 14);
  let events = scheduler.buildRangeScheduler(props.schGrid.start, newEndDate);
  let booking = new Bookings(props.schGrid.start, props.schGrid.end, scheduler.positions);
  events.unavailableSlots.push(...await booking.getBookingsRecs())

  let busyTime = events.unavailableSlots
  let availableTimes = events.availableSlots
  let quickDate: ScheduleEvent = {
    end: "",
    products: product.value,
    start: undefined,
    startTime: 0,
    title: "",
    endTime: 21
  }
  availableTimesArr.value = scheduler.findNearestTime(quickDate, product.value, availableTimes, busyTime, false)[0]
}

const updBookingTime = async (t) => {
  let dateParts = t.sl.date.split('.')
  let day = dateParts[0];
  let month = dateParts[1];
  let year = dateParts[2];
  let timeParts = t.tm.split(':')
  let hours = timeParts[0];
  let minutes = timeParts[1];
  let updTime = Utils.getLocalISODateTimeWoTz(new Date(year, month - 1, day, hours, minutes))
  await updateRec(updTime)
  closeDialog(props.event);
}

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
    A: {pattern: /[A-я;,.']/},
    a: {pattern: /[a-я;,.']/, multiple: true}
  }
}

</script>