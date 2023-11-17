<template>
    <v-row style="height: 75vh; overflow-y: auto;" class="ma-1 flex-nowrap">
        <wt
          :on-event-create="onEventCreate" @cell-dblclick="cumstomEventCreator($event)" :on-event-click="currView === 'month'? openCurrDay : editEvent" :cell-click-hold="false"
          :time-to="21 * 60"  :snap-to-time="5"  :time-step="30" ref="vuecal" class="rounded" v-model:active-view="currView" hide-view-selector locale="ru" :special-hours="specialHours"
          :editable-events="{ title: false, drag: true, resize: true, delete: true, create: true }" :events="currView === 'month'? monthView : events" :split-days="employeesArr" :sticky-split-labels="true" 
          events-on-month-view="true" :disable-views="[ 'week','years']" :drag-to-create-event="false" :time-from="6 * 60" @view-change="onViewChange" :min-date="new Date()">
          <template #title="{title, view }">
            <span v-if="view.id === 'month'">{{ view.firstCellDate.format('DD.MM.YYYY') }}-{{ view.lastCellDate.format('DD.MM.YYYY')}}</span>
          </template>
          <template v-if="currView === 'month'" #event="{ event }">
            <div class="vuecal__event-title">{{ event.title }}</div>
            <v-menu activator="parent" location="end" :close-on-content-click="false">
              <v-card min-width="300" max-height="300" class="pa-4">
                <vue-cal active-view="day" @cell-dblclick="cumstomEventCreator($event)" :on-event-create="onEventCreate" :split-days="employeesArr" hide-view-selector hide-title-bar
                 :events="events" :selected-date="selectedCurrDate" locale="ru" :cell-click-hold="false" :drag-to-create-event="false" :snap-to-time="5"  :time-step="30" ref="vuecal"
                 :time-from="startSelectedCell * 60" :time-to="endSelectedCell * 60" sticky-split-labels show-time-in-cells >
                </vue-cal>
              </v-card>
            </v-menu>
          </template> 
        </wt>
        <v-expand-x-transition>
          <VCard v-show="drawer" class="mb-auto mx-1" max-width="20vw">
            <VForm>
              <VCol>
                <v-row class="text-body-1 ma-2" style="min-width: 200pt;">Фильтровать по: <v-spacer></v-spacer><v-icon @click="drawer=false">mdi-close</v-icon></v-row>

                <v-combobox v-model="schedulerItemGroup" density="compact" label="Раздел расписания" multiple :items="['терапевты','кардиологи','гастроэнтерологи','узи','анализы']" 
                variant="underlined"></v-combobox>

                <v-combobox chips closable-chips readonly multiple v-model="products" density="compact" label="Услуга" :items="productsArr"  variant="underlined"
                @click="schedulerItemGroup || employees? false : openDialog(SearchProductDilaog, {title: 'Поиск товаров и услуг', text_field: 'Товар или услуга', reqAction: searchProds, prices: true, action: setProds})"></v-combobox>
                
                <v-combobox chips closable-chips  multiple v-model="employees" density="compact" label="Сотрудник" :items="employeesArr" item-title="title" item-value="id" variant="underlined"
                @click="schedulerItemGroup || products? false : openDialog(SearchProductDilaog, {title: 'Поиск сотрудника', text_field: 'Иванов Иван Иванович', reqAction: searchEmployee, prices: false, action: setEmployees})" ></v-combobox>
                
                <v-combobox v-model="division" density="compact" label="Филиал" :items="divisions" item-title="label" item-value="id" variant="underlined"></v-combobox>
                
                <v-card-actions style="min-width: 200pt;">
                  <VBtn variant="text" @click="">Поиск</VBtn>
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
import wt from '~~/components/customMonthView/vue-cal-m';
import type { IPageData, PageMap } from '~~/lib/PageMap';
import { QueryParams, QueryProductFtsList } from '~~/lib/MoApi/RequestArgs';
import { ProductFtsViews, type IProductFtsListView } from '~/lib/MoApi/Views/ProductFtsListView';
import { EmployeesViews, type IEmployeeListView } from '~~/lib/MoApi/Views/EmployeesViews';

//__________________________VVV Статичные данные, удалить при работе с API VVV
let specialHours = ref({7: { from: 6 * 60, to: 21 * 60, class: 'not_working_hours', title: ''}})

let divisions = ref([])

let monthView = ref([])

let events = []

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

let titleOnMonth = ref()
let vuecal = ref<any>(null);
let products = ref()
let productsArr = ref([])
let employees = ref()
let employeesArr = ref<any>([])
// employeesArr = ref([
//     { id: 1, class: ' font-weight-thin text-caption', specialist: "кардиолог", title: "Бобров А.В.",},
//     { id: 2, class: ' font-weight-thin text-caption', specialist: "терапевт", title: "Александров Б.Ю.",},
//     { id: 3, class: ' font-weight-thin text-caption', specialist: "гастроэнтеролог", title: "Рязанцев М.В.", },
//     { id: 4, class: ' font-weight-thin text-caption', specialist: "терапевт", title: "Арсеньтьев Н.В.", }
// ])
let quantum = ref(60)
let currEvent = ref<any>(null)
let division = ref<any>()
let drawer = ref(true)
let selectedCurrDate = ref()
let startSelectedCell = ref()
let endSelectedCell = ref()
let schedulerItemGroup = ref()
const employeesViews = iocc.get(EmployeesViews);
const productsView = iocc.get(ProductFtsViews);
let schedItemGroupCookie = useCookie('schedulerItemGroup', {default: () => ([]), watch: true});
let divisionCookie = useCookie('division', {default: () => ([]), watch: true});

const setProds = (p) => {
  products.value = p;
  productsArr.value = p;
}

const setEmployees = (e) => {
  employees.value = e;
  employeesArr.value = e;
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



const searchEmployee = async(txt) => {
  let reqStr = '';
  let fio = txt.split(" ");
  if(fio[0]){ fio[0] = `surname like '${fio[0]}'`};
  if(fio[1]){ fio[1] = `and name like '${fio[1]}'`};
  if(fio[2]){ fio[2] = `and patronymic like '${fio[2]}'`};
  reqStr = fio.toString().replace(/,/g, '');

  let recArr = await employeesViews.getEmployeeListView(new QueryParams('id, name, surname, patronymic', reqStr, null, 20));
    const empl:IEmployeeListView[] = [];
    let row: IEmployeeListView | undefined;
    while (row = recArr.getNext()) {
      Object.defineProperty(row, 'title', {
        value: row.surname+' '+row.name+' '+row.patronymic 
      })
      empl.push(row);
    }
    return empl
}

const searchProds = async(txt, cats) => {
  let prodsArr = await productsView.getProductFtsListView( new QueryProductFtsList('id, title, fullTitle, catalogTitle, sectionTitle',  txt, 20, 1, false, cats, false))
    const prods: IProductFtsListView[] = [];
    let row: IProductFtsListView | undefined;
    while (row = prodsArr.getNext()) {
        prods.push(row);
    }
    return prods
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
  employeesArr.value = employees.value;
  schedulerItemGroup.value = [];
  employees.value = [];
  products.value = [];
  division.value = []
}

const onViewChange = ({ view }) => {
  if (view === 'month') {
    let cells: any = []
    // let today = new Date()
    // let weekDay = today.getDay()
    setTimeout(() => {
      cells = Array.from(document.querySelectorAll('.vuecal__cell'))

      // cells.forEach((day: any) => {
      //   if (day.className.includes('before-min')) {
      //     day.classList.remove('vuecal__cell--before-min').remove('vuecal__cell--disabled')
      //   }
      // })

      cells.forEach((day: any) => {
        if (day.className.includes('out-of-scope')) {
          day.classList.remove('vuecal__cell--out-of-scope')
        }
      })
    }, 200)
  }
}

let pageMapData: IPageData = reactive({title: "Журнал предварительной записи", icon: "", mainBtnBar: [
{ id: "day", title: "День", icon: "", disabled:false, color:"secondary", bkgColor:"red", action: () => currView.value = 'day' },
{ id: "month", title: "Месяц", icon: "", disabled:false, color:"secondary", bkgColor:"red", action: () => currView.value = 'month' },
{ id: "filterBtn", title: "", icon: "mdi-filter", disabled:false, color:"secondary", bkgColor:"red", action: () => drawer.value = !drawer.value },
]});

pageMap.setPageData("/administration/test_journal", pageMapData);

defineExpose({eventsHandler});

</script>
<style >
.vuecal__title-bar{
  background-color: transparent;
  justify-content: center;
}
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

.vuecal__cell--before-min{color:#00000040}

.vuecal--month-view .vuecal__cell-content {
  justify-content: flex-start;
  height: 100%;
  align-items: flex-end;
}
.vuecal--month-view .vuecal__cell-date {padding: 4px;}
.vuecal--month-view .vuecal__no-event {display: none;}
.vuecal__cell--disabled {
    color: #00000040;
    cursor: pointer;
}
</style>
