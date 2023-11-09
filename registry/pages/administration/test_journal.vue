<template>
    <v-row style="height: 75vh; overflow-y: auto;" class="ma-1 flex-nowrap">
        <vue-cal
          :on-event-create="onEventCreate" @cell-dblclick="cumstomEventCreator($event)" :on-event-click="currView === 'month'? openCurrDay : editEvent" :cell-click-hold="false"
          :time-to="21 * 60"  :snap-to-time="5"  :time-step="30" ref="vuecal" class="rounded" v-model:active-view="currView" hide-view-selector locale="ru" :special-hours="specialHours"
          :editable-events="{ title: false, drag: true, resize: true, delete: true, create: true }" :events="currView === 'month'? monthView : events" :split-days="empls" :sticky-split-labels="true" 
          events-on-month-view="true" :disable-views="[ 'year', 'week','years']" :drag-to-create-event="false" :time-from="6 * 60">
          <template v-if="currView === 'month'" #event="{ event }">
            <div class="vuecal__event-title">{{ event.title }}</div>
            <v-menu activator="parent" location="end" :close-on-content-click="false">
              <v-card min-width="300" max-height="300" class="pa-4">
                <vue-cal active-view="day" @cell-dblclick="cumstomEventCreator($event)" :on-event-create="onEventCreate" :split-days="empls" hide-view-selector hide-title-bar
                 :events="events" :selected-date="selectedCurrDate" locale="ru" :cell-click-hold="false" :drag-to-create-event="false" :snap-to-time="5"  :time-step="30" ref="vuecal"
                 :time-from="startSelectedCell * 60" :time-to="endSelectedCell * 60" sticky-split-labels show-time-in-cells >
                </vue-cal>
              </v-card>
            </v-menu>
          </template> 
        </vue-cal>
        <v-expand-x-transition>
          <VCard v-show="drawer" class="mb-auto mx-1" max-width="20vw">
            <VForm>
              <VCol>
                <v-row class="text-body-1 ma-2" style="min-width: 200pt;">Фильтровать по: <v-spacer></v-spacer><v-icon @click="drawer=false">mdi-close</v-icon></v-row>
                <v-select v-model="schedulerSections" density="compact" label="Раздел расписания" multiple :items="['терапевты','кардиологи','гастроэнтерологи','узи','анализы']" variant="underlined"></v-select>
                <v-select v-if="schedulerSections" v-model="products" density="compact" label="Услуга" :items="productsArr" item-title="label" item-value="id" variant="underlined"></v-select>
                <v-combobox v-else chips closable-chips readonly multiple v-model="products" density="compact" label="Услуга" :items="productsArr" @click="openDialog(SearchProductDilaog, {action: setProds})" variant="underlined"></v-combobox>
                <v-select v-model="employee" density="compact" label="Сотрудник" :items="empls" item-title="label" item-value="id" variant="underlined"></v-select>
                <v-select v-model="selectedDivisions" density="compact" label="Филиал" :items="divisions" item-title="label" item-value="id" variant="underlined"></v-select>
                <v-card-actions style="min-width: 200pt;">
                  <VBtn variant="text">Поиск</VBtn>
                  <VBtn variant="text" @click="clearFilters()">Сбросить</VBtn>
                </v-card-actions>
              </VCol>
            </VForm>
          </VCard>
        </v-expand-x-transition>
    </v-row>
</template>

<script setup lang="ts">
import SearchProductDilaog from '~/components/forms/SearchProductDilaog.vue';
import EventDialog from '~~/components/forms/EventDialog.vue';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import { type IPageData, PageMap } from '~~/lib/PageMap';

//__________________________VVV Статичные данные, удалить при работе с API VVV
let specialHours = ref({7: { from: 6 * 60, to: 21 * 60, class: 'not_working_hours', label: ''}})

let divisions = ref([
  { id: 1, label: 'Вайнера 15'},
  { id: 2, label: 'Восточная 30'},
  { id: 3, label: 'Московская 52'},
  { id: 4, label: 'Родонитовая 27'},
])

let monthView = ref([
  { start: '2023-10-09 8:00', end: '2023-10-09  12:00', title: 'Утро: 5',},
  { start: '2023-10-09 12:00', end: '2023-10-09  18:00', title: 'День: 10',},
  { start: '2023-10-09 18:00', end: '2023-10-09  21:00', title: 'Вечер: 3',}
])

let events = [
    { split: 1, start: '2023-10-09 10:30', end: '2023-10-09  11:45', title: 'Иванов Роман О.', content: 'Вторичный прием', class: 'rounded not_paid mdi mdi-phone'},
    { split: 3, start: '2023-10-09 12:30', end: '2023-10-09  13:30', title: 'Иванов Роман О.', content: 'Первичный прием', class: 'rounded delivered mdi mdi-account'},
    { split: 2, start: '2023-10-09 18:30', end: '2023-10-09 19:30', title: 'Романов Иван Д.', content: 'Анализы', class: 'rounded paid mdi mdi-email'}
  ]
let employees = ref([
    { id: 1, class: ' font-weight-thin text-caption', specialist: "кардиолог", label: "Бобров А.В.",},
    { id: 2, class: ' font-weight-thin text-caption', specialist: "терапевт", label: "Александров Б.Ю.",},
    { id: 3, class: ' font-weight-thin text-caption', specialist: "гастроэнтеролог", label: "Рязанцев М.В.", },
    { id: 4, class: ' font-weight-thin text-caption', specialist: "терапевт", label: "Арсеньтьев Н.В.", }
])

let status = ref([
  {icon: 'mdi-account', title: 'Контакт'},
  {icon: 'mdi-pencil', title: 'Предварительная запись'},
  {icon: 'mdi-email', title: 'Напоминание'},
  {icon: 'mdi-phone', title: 'Лид'},
])
//__________________________^^^ Статичные данные, удалить при работе с API ^^^


const iocc=useContainer();
const pageMap = iocc.get<PageMap>("PageMap");
let currView = ref('day');

let vuecal = ref<any>(null);
let products = ref()
let productsArr = ref([])
let employee = ref()
let empls = ref(employees.value)
let quantum = ref(60)
let currEvent = ref<any>(null)
let selectedDivisions = ref<any>()
let selectedEmployee = ref()
let drawer = ref(true)
let selectedCurrDate = ref()
let startSelectedCell = ref()
let endSelectedCell = ref()
let idSelectedCell = ref()
let schedulerSections = ref()

const setProds = (p) => {
  products.value = p;
  productsArr.value = p;
}

const eventsHandler= (e) => {

  cumstomEventCreator(e);
  return false;
};

const eventAlteration = (data) => {
currEvent.value.title = data.title;
currEvent.value.split = data.employee;
currEvent.value.class = data.class;
return currEvent
}

const openCurrDay = (ev) => {
  selectedCurrDate.value = ev.start.format('MM/DD/YYYY');
  startSelectedCell.value = ev.start.formatTime('H');
  endSelectedCell.value = ev.end.formatTime('H');
}

const closeCurrDay = () => {
  console.log('here i am closed')

}

const cumstomEventCreator = (ev) => {
  vuecal.value.createEvent(ev.date, quantum.value, {split: ev.split, title: '', duration: quantum.value,  class: 'rounded not_paid mdi mdi-pencil', content: 'Название услуги'});
}

const onEventCreate = (event, deleteEventFunction) => {
  currEvent.value = event;
  event.deleteEventFunction = deleteEventFunction;
  openDialog(EventDialog, {event: currEvent.value, employees: employees.value, status: status.value, creation: true, mainAction: eventAlteration, delFunc: deleteEventFunction});
  return event
}

const editEvent = (event) => {
  currEvent.value = event;
  openDialog(EventDialog, {event: currEvent.value, employees: employees.value, status: status.value, creation: false, mainAction: eventAlteration, delFunc: event.deleteEventFunction});
  return event
}

const clearFilters = () => {
  empls.value = employees.value;
  schedulerSections.value = '';
  employee.value = '';
  products.value = '';
}

let pageMapData: IPageData = reactive({title: "Журнал предварительной записи", icon: "", mainBtnBar: [
{ id: "day", title: "День", icon: "", disabled:false, color:"secondary", bkgColor:"red", action: () => currView.value = 'day' },
{ id: "month", title: "Месяц", icon: "", disabled:false, color:"secondary", bkgColor:"red", action: () => currView.value = 'month' },
{ id: "filterBtn", title: "", icon: "mdi-filter", disabled:false, color:"secondary", bkgColor:"red", action: () => drawer.value = !drawer.value },
]});

pageMap.setPageData("/administration/test_journal", pageMapData);

defineExpose({eventsHandler});

</script>
<style>
.not_working_hours{
  background-color:#929090;
}
.separator{
  background-color: #c0c0c049;
  z-index: 0;
}
.vuecal__event {cursor: pointer;}
.vuecal .day-split-header {
  box-sizing: border-box;
  word-break: break-all;
  padding-left: 1px;
}
.not_paid {background-color: #fff2f2;}
.paid {background-color: #dbf3ea;}
.book {background-color: rgba(152, 185, 247, 0.5);}
.delivered {background-color: #fff;}
.vuecal--month-view .vuecal__cell {height: 110px;}

.vuecal--month-view .vuecal__cell-content {
  justify-content: flex-start;
  height: 100%;
  align-items: flex-end;
}
.vuecal--month-view .vuecal__cell-date {padding: 4px;}
.vuecal--month-view .vuecal__no-event {display: none;}
/* .vuecal--month-view .vuecal__event {
  width: 30%;
  display: inline-block;
} */
</style>
