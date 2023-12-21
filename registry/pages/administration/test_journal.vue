<template>
  <v-row style="height: 75vh; overflow-y: auto;" class="ma-1 flex-nowrap">
    <wt :on-event-create="onEventCreate" @cell-dblclick="cumstomEventCreator($event)"
      :on-event-click="currView === 'month' ? openCurrDay : editEvent" :cell-click-hold="false" :time-to="21 * 60"
      :snap-to-time="5" :time-step="30" ref="vuecal" class="rounded" v-model:active-view="currView" hide-view-selector
      locale="ru" :special-hours="specialHours"
      :editable-events="{ title: false, drag: true, resize: true, delete: true, create: true }"
      :events="currView === 'month' ? monthView : events" :split-days="employeesArr" :sticky-split-labels="true"
      events-on-month-view="short" :disable-views="['year', 'years']" :drag-to-create-event="false" :time-from="6 * 60"
      @view-change="onViewChange" :selected-date="selDate" :min-date="monthViewMinDate" :max-date="monthViewMaxDate">
      <template #title="{ title, view }">
        <span v-if="view.id === 'month'">{{ view.firstCellDate.format('DD.MM.YYYY') }}-{{
          view.lastCellDate.format('DD.MM.YYYY') }}
          <v-btn variant="text" icon="mdi-calendar-today" @click="monthViewDates(false)"></v-btn>
        </span>
      </template>
      <template v-if="currView === 'month'" #event="{ event }">
        <div class="vuecal__event-title">{{ event.title }}</div>
        <v-menu activator="parent" location="end" :close-on-content-click="false">
          <v-card min-width="300" max-height="300" class="pa-4">
            <vue-cal active-view="day" @cell-dblclick="cumstomEventCreator($event)" :on-event-create="onEventCreate"
              :split-days="employeesArr" hide-view-selector hide-title-bar :events="events"
              :selected-date="selectedCurrDate" locale="ru" :cell-click-hold="false" :drag-to-create-event="false"
              :snap-to-time="5" :time-step="30" ref="vuecal" :time-from="startSelectedCell * 60"
              :time-to="endSelectedCell * 60" sticky-split-labels show-time-in-cells>
            </vue-cal>
          </v-card>
        </v-menu>
      </template>
    </wt>
    <v-expand-x-transition>
      <VCard v-show="drawer" class="mb-auto mx-1" max-width="20vw">
        <VForm>
          <VCol>
            <v-row class="text-body-1 ma-2" style="min-width: 200pt;">Фильтровать по: <v-spacer></v-spacer><v-icon
                @click="drawer = false">mdi-close</v-icon></v-row>
            <v-text-field v-model="dateRange" label="Диапазон дат" readonly variant="underlined" density="compact"
              append-inner-icon="mdi-calendar-month">
              <v-menu v-model="dataPickerMenu" :close-on-content-click="false" activator="parent">
                <v-card>
                  <v-card-text class="pa-1">
                    <vue-cal id="datapicker" class="vuecal--date-picker" xsmall hide-view-selector :time="false"
                      active-view="month" :disable-views="['day', 'week', 'years']" locale="ru" :min-date="minDate"
                      :max-date="maxDate" @cell-click="changeDate($event)" @cell-focus="onDatePicker"
                      @view-change="onDatePicker"
                      style="width: 300px;min-height: 230px; background-color: white; border-radius: 10px; text-align: center;">
                    </vue-cal>
                  </v-card-text>
                  <v-card-actions class="pa-1">
                    <v-btn @click="monthViewDates(true)" density="compact" variant="text" class="ml-2 mt-2">{{ $t('ok')
                    }}</v-btn>
                    <v-btn @click="monthViewDates(false)" density="compact" variant="text" class="ml-2 mt-2">{{
                      $t('cancel')
                    }}</v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu></v-text-field>

            <v-combobox v-model="schedulerItemGroup" density="compact" label="Раздел расписания" multiple
              :items="['терапевты', 'кардиологи', 'гастроэнтерологи', 'узи', 'анализы']"
              variant="underlined"></v-combobox>

            <v-combobox chips closable-chips multiple v-model="products" density="compact" label="Услуга"
              :items="productsArr" variant="underlined" @click="schedulerItemGroup || employees ? false : openDialog(SearchProductDilaog, {
                title: 'Поиск товаров и услуг', full: 'Выбрать из прайс-лсита', text_field: 'Товар или услуга', reqAction: searchProds, prices: true, action:
                  setProds
              })"></v-combobox>

            <v-combobox chips closable-chips multiple v-model="employees" density="compact" label="Сотрудник"
              :items="employeesArr" item-title="title" item-value="id" variant="underlined" @click="schedulerItemGroup || products ? false : openDialog(SearchProductDilaog, {
                title: 'Поиск сотрудника', full: 'Выбрать из списка сотрудников', text_field: 'Иванов Иван Иванович', reqAction: searchEmployee, prices:
                  false, action: setEmployees
              })"></v-combobox>

            <v-combobox v-model="division" density="compact" label="Филиал" :items="divisions" item-title="label"
              item-value="id" variant="underlined"></v-combobox>

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

let status = ref([
  { icon: 'mdi-account', title: 'Контакт' },
  { icon: 'mdi-pencil', title: 'Предварительная запись' },
  { icon: 'mdi-email', title: 'Напоминание' },
  { icon: 'mdi-phone', title: 'Лид' },
])
//__________________________^^^ Статичные данные, удалить при работе с API ^^^

const iocc = useContainer();
const pageMap = iocc.get<PageMap>("PageMap");
let currView = ref('month');
let dataPickerMenu = ref(false)

let specialHours = ref({ 7: { from: 6 * 60, to: 21 * 60, class: 'not_working_hours', title: '' } })
let divisions = ref([])
let monthView = ref([{
  start: '2023-11-28 08:00',
  end: '2023-11-28 12:00',
  title: 'Утро',
},
{
  start: '2023-11-28 12:00',
  end: '2023-11-28 17:00',
  title: 'День',
},
{
  start: '2023-11-28 17:00',
  end: '2023-11-28 21:00',
  title: 'Вечер',
},])
let events = []
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
let schedItemGroupCookie = useCookie('schedulerItemGroup', { default: () => ([]), watch: true });
let divisionCookie = useCookie('division', { default: () => ([]), watch: true });
let isStartDate = ref(true)
let minDate = ref<any>('')
let maxDate = ref<any>('')
let monthViewMinDate = ref<any>(new Date())
let monthViewMaxDate = ref<any>('')
let selDate = ref(monthViewMinDate.value)
let dateRange = ref('')

const setProds = (p) => {
  products.value = p;
  productsArr.value = p;
}

const setEmployees = (e) => {
  employees.value = e;
  employeesArr.value = e;
}

const eventsHandler = (e) => {

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

const changeDate = (date) => {
  if (isStartDate.value) {
    if (maxDate.value) {
      maxDate.value = ''
      minDate.value = ''
    } else {
      minDate.value = date;
      isStartDate.value = false;
    }
  } else {
    maxDate.value = date;
    isStartDate.value = true;
  };
}

const monthViewDates = (b: boolean) => {
  if (b) {
    // let days = maxDate.value.getDate() - minDate.value.getDate();
    // let month = maxDate.value.getMonth() - minDate.value.getMonth();

    monthViewMinDate.value = minDate.value;
    monthViewMaxDate.value = maxDate.value;
    selDate.value = minDate.value;
    dateRange.value = `${minDate.value.format('DD.MM.YYYY')}-${maxDate.value.format('DD.MM.YYYY')}`;
  } else {
    monthViewMinDate.value = new Date();
    monthViewMaxDate.value = '';
    minDate.value = '';
    maxDate.value = '';
    dateRange.value = '';
    selDate.value = monthViewMinDate.value;
  }
  dataPickerMenu.value = false
}

const searchEmployee = async (txt: string) => {
  let reqStr = '';
  let recArr;
  if (txt.length) {
    let fio = txt.split(" ");
    if (fio[0]) { fio[0] = `surname like '${fio[0]}'` };
    if (fio[1]) { fio[1] = `and name like '${fio[1]}'` };
    if (fio[2]) { fio[2] = `and patronymic like '${fio[2]}'` };
    reqStr = fio.toString().replace(/,/g, '');
    recArr = await employeesViews.getEmployeeListView(new QueryParams('id, name, surname, patronymic', reqStr, null, 20));
  } else {
    recArr = await employeesViews.getEmployeeListView(new QueryParams('id, name, surname, patronymic', `surname != 'а'`, null, 20));
  }

  const empl: IEmployeeListView[] = [];
  let row: IEmployeeListView | undefined;
  while (row = recArr.getNext()) {
    Object.defineProperty(row, 'title', {
      value: row.surname + ' ' + row.name + ' ' + row.patronymic
    })
    empl.push(row);
  }
  return empl
}

const searchProds = async (txt, cats) => {
  let prodsArr = await productsView.getProductFtsListView(new QueryProductFtsList("id, title, fullTitle, catalogTitle, sectionTitle", txt, 20, 1, false, cats, false))
  const prods: IProductFtsListView[] = [];
  let row: IProductFtsListView | undefined;
  while (row = prodsArr.getNext()) {
    prods.push(row);
  }
  return prods
}

const cumstomEventCreator = (ev) => {
  vuecal.value.createEvent(ev.date, quantum.value, { split: ev.split, title: '', duration: quantum.value, class: 'rounded not_paid mdi mdi-pencil', content: 'Название услуги' });
}

const onEventCreate = (event, deleteEventFunction) => {
  currEvent.value = event;
  event.deleteEventFunction = deleteEventFunction;
  openDialog(EventDialog, { event: currEvent.value, employees: employees.value, status: status.value, creation: true, mainAction: eventAlteration, delFunc: deleteEventFunction });
  return event
}

const editEvent = (event) => {
  currEvent.value = event;
  openDialog(EventDialog, { event: currEvent.value, employees: employees.value, status: status.value, creation: false, mainAction: eventAlteration, delFunc: event.deleteEventFunction });
  return event
}

// сброс фильтров поиска бокового меню
const clearFilters = () => {
  employeesArr.value = [];
  productsArr.value = [];
  schedulerItemGroup.value = [];
  employees.value = null;
  products.value = null;
  division.value = [];
  monthViewDates(false)
}
// css стилизация для отображения выбранного диапазона
const onDatePicker = () => {
  let cells: any = []
  setTimeout(() => {
    let datapicker = document.getElementById('datapicker');
    if (minDate.value) {
      cells = Array.from(datapicker!.querySelectorAll('.vuecal__cell'))
      cells.forEach((day: any) => {
        if (!day.className.includes('before-min') && !day.className.includes('after-max')) {
          day.classList.add('date-picker-month');
        } else {
          day.classList.remove('date-picker-month');
        }
      })
    }
    let selectedRange = Array.from(datapicker!.querySelectorAll('.date-picker-month'));
    selectedRange[0].classList.add('first-day-pick');
    selectedRange[selectedRange.length - 1].classList.add('last-day-pick')
  }, 100)

}

const onViewChange = ({ view }) => {
  if (view === 'month' && !maxDate.value) {
    let cells: any = []
    setTimeout(() => {
      cells = Array.from(document.querySelectorAll('.vuecal__cell'))

      cells.forEach((day: any) => {
        if (day.className.includes('out-of-scope')) {
          day.classList.remove('vuecal__cell--out-of-scope')
        }
      })
    }, 200)
  }
}

let pageMapData: IPageData = reactive({
  title: "Журнал предварительной записи", icon: "", mainBtnBar: [
    { id: "day", title: "День", icon: "", disabled: false, color: "secondary", bkgColor: "red", action: () => currView.value = 'day' },
    { id: "month", title: "Неделя", icon: "", disabled: false, color: "secondary", bkgColor: "red", action: () => currView.value = 'week' },
    { id: "month", title: "Месяц", icon: "", disabled: false, color: "secondary", bkgColor: "red", action: () => currView.value = 'month' },
    { id: "filterBtn", title: "", icon: "mdi-filter", disabled: false, color: "secondary", bkgColor: "red", action: () => drawer.value = !drawer.value },
  ]
});

pageMap.setPageData("/administration/test_journal", pageMapData);

defineExpose({ eventsHandler });

</script>
<style >
.date-picker-month {
  background-color: rgba(150 255 194 / 35%) !important;
}

.first-day-pick {
  border-radius: 10px 0 0 10px;
}

.last-day-pick {
  border-radius: 0 10px 10px 0;
}

.vuecal--date-picker:not(.vuecal--day-view) .vuecal__cell--current .vuecal__cell-content,
.vuecal--date-picker:not(.vuecal--day-view) .vuecal__cell--today .vuecal__cell-content {
  border-color: #666666;
}

.vuecal--date-picker:not(.vuecal--day-view) .vuecal__cell--selected .vuecal__cell-content {
  background-color: #72e996;
  color: #fff;
}

.vuecal__title-bar {
  background-color: transparent;
}

.not_working_hours {
  background-color: #929090;
}

.separator {
  background-color: #c0c0c049;
  z-index: 0;
}

.vuecal--month-view .vuecal__cell .vuecal__event {
  cursor: pointer;
}

.vuecal .day-split-header {
  box-sizing: border-box;
  word-break: break-all;
  padding-left: 1px;
}

.not_paid {
  background-color: #fff2f2;
}

.paid {
  background-color: #dbf3ea;
}

.book {
  background-color: rgba(152, 185, 247, 0.5);
}

.delivered {
  background-color: #fff;
}

.vuecal__cell--before-min {
  color: #00000040
}

.vuecal--month-view .vuecal__cell {
  height: 20%;
}

.vuecal--month-view .vuecal__cell-content {
  justify-content: flex-start;
  height: 100%;
  align-items: flex-end;
}

.vuecal--month-view .vuecal__cell-date {
  padding: 4px;
}

.vuecal--month-view .vuecal__no-event {
  display: none;
}

.vuecal__cell--disabled {
  color: #00000040;
  cursor: pointer;
}
</style>
