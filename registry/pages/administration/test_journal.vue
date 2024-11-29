<template>
  <div class="d-flex flex-nowrap" >
    <wt class="rounded mx-1 vuecal--full-height-delete" style="width: 80%; height: 75vh "
        @cell-dblclick="currView === 'month' ? false : eventCreator($event)" :on-event-create="currView === 'month' ? onEventCreate : null" :showTimeInCells="currView === 'day'"
        @event-focus="currView === 'month' ? openPopUp($event) : false "
        :on-event-click="currView === 'month' ? openCurrDay : editEvent"
        :cell-click-hold="false" :time-from="startDayHours * 60" :time-to="endDayHours * 60" :snap-to-time="15"
        :time-step="timeStep" ref="vuecal" @event-delete="deleteEvent($event)"
        v-model:active-view="currView" hide-view-selector locale="ru" :special-hours="specialHours"
        :editable-events="currView === 'month' ? false : { title: false, drag: true, resize: false, delete: true, create: true }"
        :events="currView === 'month' ? monthView : events" :split-days="employeesArr" sticky-split-labels
        events-on-month-view="short" :disable-views="['year', 'years']" :drag-to-create-event="false"
        @view-change="onViewChange($event)" :selected-date="selDate" :min-date="monthViewMinDate"
        :max-date="monthViewMaxDate">
      <template #title="{ view }">
        <span v-if="view.id === 'month'">С {{ view.firstCellDate.format('DD.MM.YYYY') }} по {{ view.lastCellDate.format('DD.MM.YYYY') }}
          <v-btn variant="text" icon="mdi-calendar-today" @click="changeDate(new Date())"></v-btn>
        </span>
      </template>
      <template v-if="currView === 'month'" #event="{ event }">
        <div class="vuecal__event-title">{{ event.title }}</div>
        <v-menu activator="parent" location="top" close-on-content-click>
          <v-list size="x-small" variant="text" rounded="lg" :lines="false">
            <v-list-subheader>
              <v-menu :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  {{ prodListTitle }}
                  <v-btn variant="text" density="compact" v-bind="props">запись на
                    {{ event.title }}
                  </v-btn>
                </template>
                <!-- style="resize: both;" -->
                <v-card  class="pa-4 " max-width="600">
                  <vue-cal active-view="day" @cell-dblclick="eventCreator($event)" :on-event-click="editEvent"
                           :on-event-create="eventDialog" :split-days="employeesArr" hide-view-selector
                           hide-title-bar :events="events" :selected-date="selectedCurrDate" locale="ru"
                           :cell-click-hold="false" :drag-to-create-event="false" :snap-to-time="5"
                           :time-step="30" ref="vuecal" :time-from="event.startTime * 60"
                           showTimeInCells
                           :time-to="event.endTime * 60" sticky-split-labels style="width: fit-content; max-height: 300px">
                  </vue-cal>
                </v-card>
              </v-menu>
            </v-list-subheader>
            <v-list-item v-for="(item) in prodsList" density="compact">
              <v-list-item-title class="text-body-2">{{ item.title }}</v-list-item-title>
              <template v-if="item.time" v-slot:append>
                <v-btn variant="text" @click="eventDiagFromMonth(item)">{{ item.time }}</v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </wt>
    <v-expand-x-transition>
      <VCard v-show="drawer" class="mb-auto mx-1" style="width: 20%;" flat>
        <VForm>
          <vue-cal v-if="currView !== 'month'" id="datapicker" class="vuecal--date-picker" xsmall hide-view-selector :time="false"
                   active-view="month"
                   :disable-views="['day', 'week', 'year', 'years']" locale="ru" :min-date="minDate" :max-date="maxDate"
                   @cell-click="changeDate($event)"
                   style="background-color: white; border: none; text-align: center;">
          </vue-cal>
          <InputField customVariant="underlined" :state="fieldsOptions" :type="EDataType.referenceMultiple" class="my-2 pa-0" hide-details density="compact"
                      :disabled="(!!employees.length && !selectedSchedulerItemGroup?.title) || (!!products.length && !selectedSchedulerItemGroup?.title)"
                      v-model="selectedSchedulerItemGroup" label="Раздел расписания" :items="schedulerItemGroups"
                      :finderDataProvider="scheduleItemFinderDataProvider" @update:model-value="requestSchedule()"/>

          <InputField customVariant="underlined" :state="fieldsOptions" hide-details class="my-2 pa-0" density="compact"
                      :type="selectedSchedulerItemGroup || employees.label ? EDataType.strictstringarray : EDataType.referenceMultiple"
                      v-model="products" label="Услуга"
                      :items="selectedSchedulerItemGroup || employees.label ? productsArr : []"
                      :item-value="'id' || 'value'" :finderDataProvider="productFinderDataProvider" width="auto"
                      @update:model-value="(selectedSchedulerItemGroup || employees.title)? filterItems() : requestSchedule()"/>

          <InputField :type="EDataType.strictstring" :state="fieldsOptions" :disabled="!products.length" hide-details class="my-2 pa-0" density="compact"
                      :items="kindOfDuration" item-value="time" v-model="productsDuration"
                      @update:model-value="filterProducts()" variant="underlined"
                      label="Искать по:"/>

          <InputField customVariant="underlined" :state="fieldsOptions" hide-details class="my-2 pa-0" density="compact"
                      :type="selectedSchedulerItemGroup || products.length ? EDataType.strictstringarray : EDataType.referenceMultiple"
                      v-model="employees" label="Сотрудники" :items="employeesArr" :item-value="'id' || 'value'" item-title="label"
                      :finderDataProvider="emplFioFinderDataProvider" width="auto"
                      @update:model-value="(selectedSchedulerItemGroup || products.length) ? filterItems() : requestSchedule()"/>

          <InputField customVariant="underlined" :state="fieldsOptions" hide-details class="my-2 pa-0" density="compact"
                      :type="selectedSchedulerItemGroup || products.length || employees.length ? EDataType.strictstringarray : EDataType.referenceMultiple"
                      v-model="division" label="Филиал" :items="divisions" :item-value="'id' || 'value'"
                      :finderDataProvider="emplFioFinderDataProvider" width="auto"
                      :disabled="!employees.length && !products.length && !selectedSchedulerItemGroup"
                      @update:model-value="selectedSchedulerItemGroup ? filterItems() : false"/>

          <InputField v-if="currView == 'day' || currView == 'week'" :type="EDataType.strictstring" :state="fieldsOptions" hide-details class="my-2 pa-0" density="compact"
                      v-model="timeStep" :items="[5, 10, 15, 30, 60]" width="auto" label="Шаг времени"/>
          <v-card-actions>
            <v-spacer></v-spacer>
            <VBtn variant="text" @click="clearFilters()">Очистить</VBtn>
          </v-card-actions>
        </VForm>
      </VCard>
    </v-expand-x-transition>
  </div>
  <v-progress-linear v-if="schdLoad" color="primary" indeterminate rounded></v-progress-linear>
</template>

<script setup lang="ts">
import VueCal from 'vue-cal';
import * as Utils from '~/lib/Utils';
import {EDataType} from '~/lib/globalTypes';
import InputField from '~/components/InputField.vue';
import wt from '~~/components/customMonthView/vue-cal-m';
import type {MoApiClient} from '~/lib/MoApi/MoApiClient';
import '~~/components/customMonthView/custom-cal-style.scss';
import EventDialog from '~~/components/forms/EventDialog.vue';
import {RecordsStore} from '~/lib/MoApi/Records/RecordsStore';
import type {IFrameHeaderData, PageMap} from '~~/lib/PageMap';
import {PositionsViews} from '~/lib/MoApi/Views/PositionsViews';
import {EmployeeRecord} from '~/lib/MoApi/Records/EmployeeRecord';
import {ScheduleEvent} from '~/components/customMonthView/SchedulerTypes';
import type {IApiDataListResult, IApiResult} from '~/lib/MoApi/RequestResults';
import {ProductsCatalogRecord} from '~/lib/MoApi/Records/ProductsCatalogRecord';
import {ScheduleApiSection, type TDatedScheduleTimespanItems} from '~/lib/MoApi/ApiSectionsV1/SchedulerApiSection';
import {ClientContactsRecord} from "~/lib/MoApi/Records/ClientContactsRecord";
import {ProductRecord, ProductRecordData} from '~/lib/MoApi/Records/ProductRecord';
import {BookingsViews, type IBookingListView} from '~/lib/MoApi/Views/BookingViews';
import {PositionRecord, PositionRecordData} from '~/lib/MoApi/Records/PositionRecord';
import type ScheduleTimespanItem from '~/lib/MoApi/Records/DataEntities/ScheduleTimespanItem';
import {ProductFinderDataProvider} from '~/libVis/FinderDataProviders/ProductFinderDataProvider';
import {EmployeeFioFinderDataProvider} from '~/libVis/FinderDataProviders/EmployeeFioFinderDataProvider';
import {ScheduleItemFinderDataProvider} from '~/libVis/FinderDataProviders/ScheduleItemFinderDataProvider';
import {ScheduleItemGroupData, ScheduleItemGroupRecord} from '~/lib/MoApi/Records/SchedulerItemGroupRecord';
import {
  BookingGridInfo,
  ScheduleGrid,
  ScheduleGridInfo,
  ScheduleGridOptions,
  type TGridQuerySch
} from '~/lib/Booking/ScheduleGrid';
import {BookingRecord} from "~/lib/MoApi/Records/BookingRecord";
import {Scheduler} from "~/components/customMonthView/scheduler";
import {Bookings} from "~/lib/Booking/Bookings";
// import { BookingQuery, QueryParams, QueryParamsScheduler, QuerySchedule } from '~~/lib/MoApi/RequestArgs';

let status = ref({
  1: {icon: 'mdi-account', title: 'Заказано', class: 'ordered'},
  2: {icon: 'mdi-pencil', title: 'Выполнено', class: 'executed'},
  3: {icon: 'mdi-cancel', title: 'Отменено', class: 'canceled'},
})

//__________________________VVV Статичные данные, удалить при работе с API VVV
let kindOfDuration = ref([
  {time: 'short', title: 'Самой короткой'},
  {time: 'long', title: 'Самой длинной'},
  {time: 'sum', title: 'Сумме длительностей'},
])
//__________________________^^^ Статичные данные, удалить при работе с API ^^^

const iocc = useContainer();
const recStore = iocc.get(RecordsStore);
const apiClient = iocc.get<MoApiClient>('MoApiClient');
const pageMap = iocc.get<PageMap>("PageMap");
const schItemGroup = iocc.get(ScheduleApiSection);
const positionViews = iocc.get(PositionsViews);
const bookingViews = iocc.get(BookingsViews);
// const scheduleGridInfo = iocc.get(ScheduleGridInfo);
let currView = ref('month');
let dataPickerMenu = ref(false);
let schedulerItemGroups = ref<any>([])

const fieldsOptions = reactive({
  errCnt: 0,
  changedCnt: 0,
  readonly: false
})

let timeStep = ref(30)
let divisions = ref([])
let monthView = ref<ScheduleEvent[]>([])
let events = ref<ScheduleEvent[]>([])
let bookings = ref<ScheduleEvent[]>([])
let freeTimeSpans = ref<ScheduleEvent[]>([])
let vuecal = ref<any>(null);
let products = ref<any[]>([])
let productsArr = ref<any>([])
let employees = ref<any>([])
let employeesArr = ref<any>([])
let positions = ref<any>([])
let quantum = ref(20)
let currEvent = ref<any>(null)
let division = ref<any>()
let drawer = ref(true)
let selectedCurrDate = ref()
let startSelectedCell = ref()
let endSelectedCell = ref()
let selectedSchedulerItemGroup = ref<ScheduleItemGroupData | { value: string, title: string }>()
let minDate = ref<any>(new Date())
let maxDate = ref<any>(new Date())
maxDate.value.setDate(maxDate.value.getDate() + 30)
let monthViewMinDate = ref<any>(new Date())
let monthViewMaxDate = ref<any>('')
let selDate = ref(monthViewMinDate.value)
let dateRange = ref(`${minDate.value.format('DD.MM.YYYY')}`)
let currRangeData = ref<any>()
let prodsLoad = ref(false)
let schdLoad = ref(false)
let empLoad = ref(false)
let productsDuration = ref()
let isProdsList = ref(false)
let prodsList = ref<any>([])
let prodListTitle = ref<any>('')
let catalogs = ref<any>([])
let specialHours = ref()
// { 7: { from: 6 * 60, to: 21 * 60, class: 'not_working_hours', title: '' } }
let startDayHours = 7
let endDayHours = 21

const productFinderDataProvider = iocc.get(ProductFinderDataProvider);
const emplFioFinderDataProvider = iocc.get(EmployeeFioFinderDataProvider);
const scheduleItemFinderDataProvider = iocc.get(ScheduleItemFinderDataProvider);
scheduleItemFinderDataProvider.init("scheduleItem");
emplFioFinderDataProvider.init("fioEmployee");

let scheduler: Scheduler;

const eventsHandler = (e) => {
  // cumstomEventCreator(e);
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

const getCatalogList = async (keys) => {
  let list = await recStore.getRecords<ProductsCatalogRecord>(ProductsCatalogRecord, keys);
  catalogs.value = list.map((c) => c.MData);
}

const getCatalogs = async () => {
  let catalogsKeys = await apiClient.send<any, any>('/Products/FindProductsCatalogs', 'notactive != true', false);
  await getCatalogList(catalogsKeys);
  productFinderDataProvider.init("Product", true, 20, catalogs.value);
}

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Всплывающее окно с расчетом ближайшего доступного времени, алгоритм надо вычленить в отдельную функцию и сделать переиспользуемой
const openPopUp = (day_time: ScheduleEvent) => {

  prodsList.value = [];
  let selDate = day_time.start.format('YYYY-MM-DD');
  prodListTitle.value = day_time.start.format('DD.MM.YYYY');
  let prods = day_time.products.map(el => {
    const product = productsArr.value.find(pr => pr.id === el.id);
    return product ? JSON.parse(JSON.stringify(product)) : null;
  }).filter(Boolean);
  let splits = Array.from(new Set(day_time.products.map(el => el.split).map(sp => positions.value.find((pos) => pos.id === sp).employee)))
  let busyTime = events.value.filter(ev => (ev.start.slice(0, 10) == selDate)&& ((timeToMinutes(ev.start.slice(11))/60 >= day_time.startTime)) && (timeToMinutes(ev.end.slice(11))/60 <= day_time.endTime) && ev.products && splits.includes(ev.split))
  let availableTimes = freeTimeSpans.value.filter(ev => (ev.start.slice(0, 10) == selDate) && (timeToMinutes(ev.start.slice(11))/60 >= day_time.startTime));

  prodsList.value = scheduler.findNearestTime(day_time, prods, availableTimes, busyTime)

  prodsList.value = prodsList.value.map(pr => {
    if(!pr.time || !pr.start){
      let findSplit = positions.value.find(pos => pos.id == day_time.products.find(p => p.id == pr.id).split).employee;
      let fitProd = prodsList.value.find(p => p.split == findSplit && p.time);
      if(fitProd){
        pr.split = findSplit
        pr.time = fitProd.time;
        pr.start = fitProd.start;
      }
    }
    return pr
  })
  console.log(prodsList.value)
}

const changeDate = (date) => {
  maxDate.value = new Date(date);
  maxDate.value.setDate(maxDate.value.getDate() + 30)
  selDate.value = new Date(date);
  dataPickerMenu.value = false;
  monthViewMinDate.value = minDate.value;
}

function roundTime(selectedTime: string): string {
  const [hours, minutes] = selectedTime.split(':').map(Number);

  if ([10, 20, 30, 40, 50].includes(minutes)) {
    return minutes.toString(); // Возвращаем исходное время, если минуты равны 10, 20, 30, 40 или 50
  }
  const roundedMinutes = Math.floor(minutes / timeStep.value) * timeStep.value;

  return `${roundedMinutes.toString().padStart(2, '0')}`;
}

function checkTimeInIntervals(chosenTime, intervals) {
  chosenTime = new Date(chosenTime);
  for (let i = 0; i < intervals.length; i++) {
    let startTime = new Date(intervals[i].start);
    let endTime = new Date(intervals[i].end);
    if (startTime <= chosenTime && chosenTime <= endTime) {
      return intervals[i];
    }
  }
  return false;
}

const deleteEvent = async (ev) => {
  let rec = await recStore.get<BookingRecord>(BookingRecord, ev.id)
  let res = await rec.delete()
  if(res){
    events.value = events.value.filter(el => el.id !== ev.id)

  }
}

const eventCreator = async (ev) => {
  let newEvent = {
    start: ev.date,
    end: ev.date,
    split: ev.split,
    title: 'Новая запись',
    duration: quantum.value,
    class: 'rounded',
    content: 'Название услуги',
  };
  let rec = await eventDialog(newEvent)
  console.log(rec)
  if (rec){
    vuecal.value.createEvent(rec.start, rec.duration, rec);
  }

}

const eventDiagFromMonth = async(i) => {
  let event = {
    start: new Date(i.start),
    end: new Date(i.start),
    date: new Date(i.start),
    split: i.split,
    title: 'Новая запись',
    duration: i.duration,
    class: 'rounded',
    content: i.title,
    quick: true
  }

  let rec = await eventDialog(event)
  console.log(rec)
  if (rec){
    vuecal.value.createEvent(rec.start, rec.duration, rec);
  }
}

const onEventCreate = (event, deleteEventFunction) => {
  let newEv = event;
  // deleteEventFunction();
  newEv.start = newEv.start.format('YYYY-MM-DD hh:mm');
  newEv.end = newEv.end.format('YYYY-MM-DD hh:mm');
  console.log(newEv)
  events.value.push(newEv)
}

const eventDialog = async (event, creating: boolean = true) => {
  let currDate = event.start.format('YYYY-MM-DD')
  let split = event.split
  let foundedSpans = spansInSplit(freeTimeSpans.value, split, currDate)
  let foundedProducts = [...new Set(foundedSpans.map(el => el.products).flat())]
  currEvent.value = event;

  if(creating){
    if(!event.quick){
      event.start.setMinutes(roundTime(event.start.formatTime()));
      event.end.setMinutes(roundTime(event.end.formatTime()));
    }
    event.start.format('YYYY-MM-DD hh:mm');
    event.end.format('YYYY-MM-DD hh:mm');
  } else {
    if(!currEvent.value.client.phone){
      let clientConts = await recStore.fetch(ClientContactsRecord, currEvent.value.client.id);
      if(clientConts){
        currEvent.value.client.phone = clientConts.Data?.mainPhone
      }
    }
    // let bookingRec = await recStore.fetch(BookingRecord, event.id);
    // deleteEventFunction = bookingRec.delete
  }

  let fitSpan = checkTimeInIntervals(event.start, foundedSpans);

  if(fitSpan || !creating){
    if(fitSpan.end < event.end){
      event.end = fitSpan.end
    }
    return new Promise(resolve => {
      openDialog(EventDialog, {
        event: currEvent.value,
        schGrid: {start: minDate.value, end: maxDate.value},
        scheduler: scheduler,
        employees: employeesArr.value,
        positions: positions.value,
        products: foundedProducts,
        status: status.value,
        creation: creating,
        mainAction: eventAlteration,
        clientData: creating ? null : currEvent.value.client
      },
          true,
          true,
          (e, d) => {
        if (e == "onBeforeClose")
          resolve(d);
        return true;
      });
    })

  } else {
    console.log('Невозможно создать запись на выбранную дату')
  }

  event = currEvent.value;
  console.log(event)
  return event
}

const editEvent = async (event) => {
  let rec = await eventDialog(event, false);
  if(rec.deleting){
    events.value = events.value.filter(el => el.id !== rec.id)
  }
}

const getBookings = async () => {
  const booking = new Bookings(minDate.value, maxDate.value, positions.value);
  bookings.value = await booking.getBookingsRecs()
}

const getEmployeeList = async (k) => {
  let keys = k.map((id) => id.replaceAll(`'`, `"`))
  let emplsRec: any[] = [];

  const chunkSize = 500;
  const totalChunks = Math.ceil(keys.length / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const chunkKeys = keys.slice(i * chunkSize, (i + 1) * chunkSize);
    let recs = await recStore.getRecords<PositionRecord>(PositionRecord, chunkKeys);
    positions.value = Array.from(recs.map(i => i.MData));
    let emplsKeys = recs.map(i => i.MData).map((el: any) => el.employee.replaceAll(`'`, `"`));
    let chunkEmplsRec = await recStore.getRecords<EmployeeRecord>(EmployeeRecord, emplsKeys);
    emplsRec.push(...chunkEmplsRec);
  }

  return emplsRec.map(i => i.MData);
}

const spansInSplit = (arr: ScheduleEvent[], split: string, date: string) => {
  return arr.map(i => {
    if (i.split === split && i.start.slice(0, -6) === date) {
      return i;
    }
  }).filter(Boolean);
}

let durationCondition = ref<number | null>(null)

const filterItems = async () => {
  if (products.value.length && !employees.value.length) {
    employeesArr.value = await filterOtherField(products.value, currRangeData.value!)
    products.value = products.value.map(productId => productsArr.value.find(product => product.id === productId));
    monthView.value = scheduler.buildMonthScheduler(employees.value, products.value)
  }
  if (employees.value.length) {
    employees.value = employees.value.map(employeeId => employeesArr.value.find(employee => employee.id === employeeId));
    monthView.value = scheduler.buildMonthScheduler(employees.value, products.value)
  }
}

const filterOtherField = async (ids: string[], currdata: any[]) => {
  const times: ScheduleTimespanItem[][] = Object.values(currdata);
  const matchingPositions = [...new Set(times.map(day => day.filter(span => span.products?.some(product => ids.includes(product))).map(span => span.position)).flat())];
  let arr = Array.from(await getEmployeeList(matchingPositions));
  return arr
}

const filterProducts = () => {
  if (productsDuration.value == 'short') {
    let min = products.value[0].duration;
    for (const item of products.value) {
      if (item.duration < min) {
        min = item.duration;
      }
    }
    durationCondition.value = min;
  }
  if (productsDuration.value == 'long') {
    let max = products.value[0].duration;
    for (const item of products.value) {
      if (item.duration > max) {
        max = item.duration;
      }
    }
    durationCondition.value = max;
  }
  if (productsDuration.value == 'sum') {
    let sum = 0;
    for (const item of products.value) {
      sum += item.duration
    }
    durationCondition.value = sum;
  }

  scheduler.buildMonthScheduler(employees.value, products.value)
}

// сброс фильтров поиска бокового меню
const clearFilters = () => {
  employeesArr.value = [];
  productsArr.value = [];
  selectedSchedulerItemGroup.value = undefined;
  employees.value = [];
  products.value = [];
  division.value = [];
  changeDate(new Date)
  // getSchedule();
}

const onViewChange = (ev) => {
  if (ev.view === 'month') {
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

const requestSchedule = async () => {
  schdLoad.value = true
  if (selectedSchedulerItemGroup.value) {

    scheduler = new Scheduler(startDayHours, endDayHours)

    let res = await scheduler.getScheduleByItemGroup(selectedSchedulerItemGroup.value, minDate.value, maxDate.value)
    employeesArr.value = res.empArr
    productsArr.value = res.prodArr
    positions.value = res.positions

    let data = res.buildRangeScheduler(minDate.value, maxDate.value);
    freeTimeSpans.value = data.availableSlots;
    events.value = data.unavailableSlots;

    await getBookings();

    events.value.push(...bookings.value)
  }
  if (!selectedSchedulerItemGroup.value && (products.value || employees.value)) {
    let prodsIds: any = null;
    let positionsIds: any = null;

    if (employees.value) {
      const select = "id";
      const where = `employee='${employees}'`;
      positionsIds = await positionViews.getPositionListView({select, where, limit: 0});
      positionsIds = positionsIds._data.flat();
    }

    if (products.value) {
      prodsIds = products.value.map((i: any) => i.value);
    }

    scheduler = new Scheduler(startDayHours, endDayHours)

    let res = await scheduler.getScheduler(minDate.value.format('YYYY-MM-DD'), maxDate.value.format('YYYY-MM-DD'), positionsIds, prodsIds, divisions.value)
    console.log(res)
  }
  schdLoad.value = false
  monthView.value = scheduler.buildMonthScheduler(employees.value, products.value)
}

let pageMapData: IFrameHeaderData = reactive({
  title: "Журнал предварительной записи", icon: "", mainBtnBar: [
    {
      id: "day",
      title: "День",
      icon: "",
      disabled: false,
      color: "secondary",
      bkgColor: "red",
      action: () => currView.value = 'day'
    },
    {
      id: "month",
      title: "Неделя",
      icon: "",
      disabled: false,
      color: "secondary",
      bkgColor: "red",
      action: () => currView.value = 'week'
    },
    {
      id: "month",
      title: "Месяц",
      icon: "",
      disabled: false,
      color: "secondary",
      bkgColor: "red",
      action: () => currView.value = 'month'
    },
    {
      id: "filterBtn",
      title: "",
      icon: "mdi-filter",
      disabled: false,
      color: "secondary",
      bkgColor: "red",
      action: () => drawer.value = !drawer.value
    },
  ]
});


// getScheduleItemGroupIds();
getCatalogs();

pageMap.setPageData("/administration/test_journal", pageMapData);

defineExpose({eventsHandler});

</script>

<style scoped>
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

.not_working_hours {
  background-color: #929090;
}

.separator {
  background-color: #c0c0c049;
  z-index: 0;
}

</style>
