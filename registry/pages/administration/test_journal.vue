<template>
  <div class="d-flex flex-nowrap" style="height: 75vh;">
    <wt class="rounded mx-1" style="width: 80%;" :on-event-create="onEventCreate"
        @cell-dblclick="cumstomEventCreator($event)" :showTimeInCells="currView === 'day'"
        @event-focus="currView === 'month' ? openPopUp($event) : false "
        :on-event-click="currView === 'month' ? openCurrDay : editEvent"
        :cell-click-hold="false" :time-from="startDayHours * 60" :time-to="endDayHours * 60" :snap-to-time="15"
        :time-step="30" ref="vuecal"
        v-model:active-view="currView" hide-view-selector locale="ru" :special-hours="specialHours"
        :editable-events="currView === 'month' ? false : { title: false, drag: true, resize: true, delete: true, create: true }"
        :events="currView === 'month' ? monthView : events" :split-days="employeesArr" sticky-split-labels
        events-on-month-view="short" :disable-views="['year', 'years']" :drag-to-create-event="false"
        @view-change="onViewChange($event)" :selected-date="selDate" :min-date="monthViewMinDate" :min-split-width="50"
        :max-date="monthViewMaxDate">
      <template #title="{ view }">
        <span v-if="view.id === 'month'">С {{
            view.firstCellDate.format('DD.MM.YYYY')
          }} по {{ view.lastCellDate.format('DD.MM.YYYY') }}
          <v-btn variant="text" icon="mdi-calendar-today" @click="changeDate(new Date())"></v-btn>
        </span>
      </template>
      <template #split-label="{ split }">
        <p>{{ split.title }}</p>
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
                <v-card max-height="300" class="pa-4 " max-width="600">
                  <vue-cal active-view="day" @cell-dblclick="cumstomEventCreator($event)" :on-event-click="editEvent"
                           :on-event-create="onEventCreate" :split-days="employeesArr" hide-view-selector
                           hide-title-bar :events="events" :selected-date="selectedCurrDate" locale="ru"
                           :cell-click-hold="false" :drag-to-create-event="false" :snap-to-time="5"
                           :time-step="30" ref="vuecal" :time-from="event.startTime * 60"
                           showTimeInCells
                           :time-to="event.endTime * 60" sticky-split-labels style="width: fit-content;">
                    <template #split-label="{ split }">
                      <p>{{ split.title }}</p>
                    </template>
                  </vue-cal>
                </v-card>
              </v-menu>
            </v-list-subheader>
            <v-list-item v-for="(item) in prodsList" density="compact">
              <v-list-item-title class="text-body-2">{{ item.title }}</v-list-item-title>
              <template v-if="item.time" v-slot:append>
                <v-btn variant="text">{{ item.time }}</v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </wt>
    <v-expand-x-transition>
      <VCard v-show="drawer" class="mb-auto mx-1" style="width: 20%;" flat>
        <VForm>
          <vue-cal id="datapicker" class="vuecal--date-picker" xsmall hide-view-selector :time="false"
                   active-view="month"
                   :disable-views="['day', 'week', 'year', 'years']" locale="ru" :min-date="minDate" :max-date="maxDate"
                   @cell-click="changeDate($event)"
                   style="background-color: white; border: none; text-align: center;">
          </vue-cal>
          <InputField customVariant="underlined" :state="fieldsOptions" :type="EDataType.referenceMultiple"
                      :disabled="(!!employees.length && !selectedSchedulerItemGroup?.title) || (!!products.length && !selectedSchedulerItemGroup?.title)"
                      v-model="selectedSchedulerItemGroup" label="Раздел расписания" :items="schedulerItemGroups"
                      :finderDataProvider="scheduleItemFinderDataProvider" @update:model-value="requestSchedule()"/>

          <InputField customVariant="underlined" :state="fieldsOptions"
                      :type="selectedSchedulerItemGroup || employees.title ? EDataType.strictstringarray : EDataType.referenceMultiple"
                      v-model="products" label="Услуга"
                      :items="selectedSchedulerItemGroup || employees.title ? productsArr : []"
                      :item-value="'id' || 'value'" :finderDataProvider="productFinderDataProvider" width="auto"
                      @update:model-value="(selectedSchedulerItemGroup || employees.title)? filterItems() : getSchedule()"/>


          <InputField :type="EDataType.strictstring" :state="fieldsOptions" :disabled="!products.length"
                      :items="kindOfDuration" item-value="time" v-model="productsDuration"
                      @update:model-value="filterProducts()" variant="underlined"
                      label="Искать по:"/>

          <InputField customVariant="underlined" :state="fieldsOptions"
                      :type="selectedSchedulerItemGroup || products.length ? EDataType.strictstringarray : EDataType.referenceMultiple"
                      v-model="employees" label="Сотрудники" :items="employeesArr" :item-value="'id' || 'value'"
                      :finderDataProvider="emplFioFinderDataProvider" width="auto"
                      @update:model-value="(selectedSchedulerItemGroup || products.length) ? filterItems() : getSchedule()"/>

          <InputField customVariant="underlined" :state="fieldsOptions"
                      :type="selectedSchedulerItemGroup || products.length || employees.length ? EDataType.strictstringarray : EDataType.referenceMultiple"
                      v-model="division" label="Филиал" :items="divisions" :item-value="'id' || 'value'"
                      :finderDataProvider="emplFioFinderDataProvider" width="auto"
                      :disabled="!employees.length && !products.length && !selectedSchedulerItemGroup"
                      @update:model-value="selectedSchedulerItemGroup ? filterItems() : false"/>

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
import {EDataType} from '~/lib/globalTypes';
import InputField from '~/components/InputField.vue';
import wt from '~~/components/customMonthView/vue-cal-m';
import type {MoApiClient} from '~/lib/MoApi/MoApiClient';
import '~~/components/customMonthView/custom-cal-style.scss';
import EventDialog from '~~/components/forms/EventDialog.vue';
import {RecordsStore} from '~/lib/MoApi/Records/RecordsStore';
import type {IFrameHeaderData, PageMap} from '~~/lib/PageMap';
import {EmployeeRecord} from '~/lib/MoApi/Records/EmployeeRecord';
import type {IApiDataListResult, IApiResult} from '~/lib/MoApi/RequestResults';
import {ScheduleEvent} from '~/components/customMonthView/SchedulerTypes';
import {ProductsCatalogRecord} from '~/lib/MoApi/Records/ProductsCatalogRecord';
import {ScheduleApiSection} from '~/lib/MoApi/ApiSectionsV1/SchedulerApiSection';
import {ProductRecord, ProductRecordData} from '~/lib/MoApi/Records/ProductRecord';
import {PositionRecord, PositionRecordData} from '~/lib/MoApi/Records/PositionRecord';
import * as Utils from '~/lib/Utils';
import {PositionsViews} from '~/lib/MoApi/Views/PositionsViews';
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
import {BookingsViews} from '~/lib/MoApi/Views/BookingViews';
// import { BookingQuery, QueryParams, QueryParamsScheduler, QuerySchedule } from '~~/lib/MoApi/RequestArgs';

//__________________________VVV Статичные данные, удалить при работе с API VVV

let status = ref([
  {icon: 'mdi-account', title: 'Контакт'},
  {icon: 'mdi-pencil', title: 'Предварительная запись'},
  {icon: 'mdi-email', title: 'Напоминание'},
  {icon: 'mdi-phone', title: 'Лид'},
])

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
const positionviews = iocc.get(PositionsViews);
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

let divisions = ref([])
let monthView = ref<ScheduleEvent[]>([])
let events = ref<ScheduleEvent[]>([])
let freeTimeSpans = ref<ScheduleEvent[]>([])
let vuecal = ref<any>(null);
let products = ref<any[]>([])
let productsArr = ref<any>([])
let employees = ref<any>([])
let employeesArr = ref<any>([])
let positions = ref<any>([])
let quantum = ref(60)
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
let startDayHours = 6
let endDayHours = 21

const productFinderDataProvider = iocc.get(ProductFinderDataProvider);
const emplFioFinderDataProvider = iocc.get(EmployeeFioFinderDataProvider);
const scheduleItemFinderDataProvider = iocc.get(ScheduleItemFinderDataProvider);
scheduleItemFinderDataProvider.init("scheduleItem");
emplFioFinderDataProvider.init("fioEmployee");

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

const getCatalogList = async (keys) => {
  let list = await recStore.getRecords<ProductsCatalogRecord>(ProductsCatalogRecord, keys);
  catalogs.value = list.map((c) => c.MData);
}

const getCatalogs = async () => {
  let catalogsKeys = await apiClient.send<any, any>('/Products/FindProductsCatalogs', 'notactive != true', false);
  await getCatalogList(catalogsKeys);
  productFinderDataProvider.init("Product", true, 20, catalogs.value);
}

const openPopUp = (day_time: ScheduleEvent) => {
  prodsList.value = []
  prodListTitle.value = day_time.start.format('DD.MM.YYYY');
  let foundedTimeSpan = currRangeData.value![day_time.start.format('YYYY-MM-DD')]
  day_time.products.map((product) => {
    const foundProduct = productsArr.value.find((prod) => prod.id === product.id);
    if (foundProduct !== undefined) {
      product.title = foundProduct.title;
      product.duration = foundProduct.duration;
      prodsList.value.push(product);
      let totalMinutes = foundedTimeSpan.find((span) => (span.products.includes(product.id) && span.timespan.duration >= product.duration && (span.timespan.time / 60 > day_time.startTime && span.timespan.time / 60 < day_time.endTime)));
      if (totalMinutes) {
        let hours = Math.floor(totalMinutes.timespan.time / 60);
        let minutes = totalMinutes.timespan.time % 60;
        product.time = `${hours > 9 ? hours : hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
  });

}

const clearMonthViewDates = () => {
  minDate.value = '';
  maxDate.value = '';
}

const changeDate = (date) => {
  minDate.value = new Date(date);
  maxDate.value = new Date(date);
  maxDate.value.setDate(maxDate.value.getDate() + 30)
  dateRange.value = `${minDate.value.format('DD.MM.YYYY')}`;
  selDate.value = minDate.value;
  dataPickerMenu.value = false;
  monthViewMinDate.value = minDate.value;
}

const cumstomEventCreator = (ev) => {
  vuecal.value.createEvent(ev.date, quantum.value, {
    split: ev.split,
    title: '',
    duration: quantum.value,
    class: 'rounded not_paid mdi mdi-pencil',
    content: 'Название услуги'
  });
}

function roundTime(selectedTime: string): string {
  const [hours, minutes] = selectedTime.split(':').map(Number);
  const roundedMinutes = Math.floor(minutes / 30) * 30;
  const roundedHours = hours + Math.floor((hours * 60 + roundedMinutes) / 60);

  return `${roundedMinutes.toString().padStart(2, '0')}`;
}

const onEventCreate = (event, deleteEventFunction) => {
  let currDate = event.start.format('YYYY-MM-DD')
  let split = event.split
  let foundedSpans = spansInSplit(freeTimeSpans.value, split, currDate)
  let foundedProducts = [...new Set(foundedSpans.map(el => el.products).flat())]
  currEvent.value = event;
  event.deleteEventFunction = deleteEventFunction;
  event.start.setMinutes(roundTime(event.start.formatTime()));
  event.end.setMinutes(roundTime(event.end.formatTime()));
  console.log(event.start)
  console.log(event.start.format('YYYY-MM-DD hh:mm'), foundedSpans.map(i => i.start), foundedSpans.map(i => i.end))
  openDialog(EventDialog, {
    event: currEvent.value,
    schGrid: {start: minDate.value, end: maxDate.value},
    employees: employeesArr.value,
    positions: positions.value,
    products: foundedProducts,
    status: status.value,
    creation: true,
    mainAction: eventAlteration,
    delFunc: deleteEventFunction
  });
  return event
}

const editEvent = (event) => {
  currEvent.value = event;
  openDialog(EventDialog, {
    event: currEvent.value,
    schGrid: {start: minDate.value, end: maxDate.value},
    employees: employeesArr.value,
    positions: positions.value,
    products: productsArr.value,
    status: status.value,
    creation: false,
    mainAction: eventAlteration,
    delFunc: event.deleteEventFunction
  });
  return event
}

const getBookings = async () => {
  const positionsIds = positions.value.map(pos => pos.id)

  let res = await bookingViews.getBookings({
    begDate: Utils.getDateStr(minDate.value),
    endDate: Utils.getDateStr(maxDate.value),
    positionIds: positionsIds,
    includeNames: false,
    includePlace: false,
    includeStatus: false,
  })
}

const getScheduleByItemGroup = async () => {
  monthViewMinDate.value = minDate.value;
  monthViewMaxDate.value = maxDate.value;
  if (selectedSchedulerItemGroup.value) {
    let res = await schItemGroup.getScheduleByItemGroup(minDate.value, maxDate.value, (selectedSchedulerItemGroup.value as {
      value: string
    }).value)
    let sch: any = res
    currRangeData.value = res
    buildMonthScheduler(sch);
    let prods: any = [];
    let empls: any = [];
    Object.values(sch).flat().map((el: any) => {
      prods.push(el.products)
      empls.push(el.position)
    });
    prods = Array.from(new Set(prods.flat()))
    productsArr.value = await getProductsList(prods)
    empls = Array.from(new Set(empls))
    employeesArr.value = Array.from(await getEmployeeList(empls))
    employeesArr.value.map((empl) =>
        empl.title = empl.surname + ' ' + (empl.name[0].toUpperCase()) + '.' + (empl.patronymic ? empl.patronymic[0] + '.' : '')
    )
  }
  await getBookings();
}


const getProductsList = async (k) => {
  const chunkSize = 500; // Устанавливаем размер чанка
  const keys = k.map((id) => id.replaceAll(`'`, `"`));
  const chunks = Array.from({length: Math.ceil(keys.length / chunkSize)}, (_, index) =>
      keys.slice(index * chunkSize, (index + 1) * chunkSize)
  );

  let recs: any[] = [];
  for (const chunk of chunks) {
    const chunkRecs = await Promise.all(chunk.map(async (i) => {
      try {
        let record = await recStore.getRecordsM([{id: {key: i, type: ProductRecord}}]);
        return record[0].MData;
      } catch (error) {
        console.error(`An error occurred while fetching record with key ${i}:`, error);
        return null; // Возвращаем null для не найденных записей
      }
    }));
    recs.push(...chunkRecs);
  }

  return recs.filter((i) => i !== null);
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

const getSchedule = async () => {
  let prodsIds: any = null;
  let positionsIds: any = null;
  if (employees.value.value) {
    let select = "id"
    let where = `employee='${employees.value.value}'`
    positionsIds = await positionviews.getPositionListView({select, where, limit: 0})
    positionsIds = positionsIds._data.flat()
  }
  if (products.value.length) {
    prodsIds = products.value.map((i: any) => i.value)
  }

  let res = await schItemGroup.getSchedule({
    begDate: minDate.value,
    endDate: maxDate.value,
    productIds: prodsIds,
    positionIds: positionsIds,
    divisionIds: division.value ? division.value : null,
    placementIds: null
  });

  let sch: any = res
  currRangeData.value = res
  buildMonthScheduler(sch);
  let prods: any = [];
  let empls: any = [];
  Object.values(sch).flat().map((el: any) => {
    prods.push(el.products)
    empls.push(el.position)
  });
  prods = Array.from(new Set(prods.flat()))
  productsArr.value = await getProductsList(prods)
  empls = Array.from(new Set(empls))
  employeesArr.value = Array.from(await getEmployeeList(empls))
  employeesArr.value.map((empl) =>
      empl.title = empl.surname + ' ' + (empl.name[0].toUpperCase()) + '.' + (empl.patronymic ? empl.patronymic[0] + '.' : '')
  )
}

const spansInSplit = (arr: ScheduleEvent[], split: string, date: string) => {
  return arr.map(i => {
    if (i.split === split && i.start.slice(0, -6) === date) {
      return i;
    }
  }).filter(Boolean);
}

const buildRangeScheduler = (start, end) => {
  let startDay = Utils.getDateStr(start).toString();
  let endDay = Utils.getDateStr(end).toString();

  const keys = Object.keys(currRangeData.value).sort();
  const keysInRange = keys.filter(key => key >= startDay && key <= endDay);

  const result = keysInRange.reduce((acc, key) => {
    acc[key] = currRangeData.value[key];
    return acc;
  }, {});

  const dates: string[] = Object.keys(result);
  const times: ScheduleTimespanItem[][] = Object.values(result);
  const unavailableSlots: ScheduleEvent[] = [];
  const rangeFreeTime: ScheduleEvent[] = [];

  const newStart = '0' + startDayHours + ':00';
  const newEnd = endDayHours + ':00';

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const timeItems = times[i];


    timeItems.forEach((item) => {
      const freeTime: ScheduleEvent = {
        start: '',
        end: '',
        products: productsArr.value.filter(i => item.products?.includes(i.id)),
        title: '',
        class: 'free_hours',
        background: true,
        split: '',
        resizable: false
      };
      const startTime = item.timespan!.time;
      const endTime = startTime + item.timespan!.duration;

      const startHours = Math.floor(startTime / 60);
      const startMinutes = startTime % 60;
      const endHours = Math.floor(endTime / 60);
      const endMinutes = endTime % 60;
      const start = `${date + ' '}${startHours < 10 ? '0' + startHours : startHours}:${startMinutes < 10 ? '0' + startMinutes : startMinutes}`;
      const end = `${date + ' '}${endHours < 10 ? '0' + endHours : endHours}:${endMinutes < 10 ? '0' + endMinutes : endMinutes}`;
      const split = positions.value.find((pos) => employeesArr.value.some(empl => empl.id === pos.employee) && pos.id === item.position).employee;
      const spans = spansInSplit(rangeFreeTime, split, date)

      if (spans.length > 0) {
        const lastSpan = spans[spans.length - 1];

        if (lastSpan.end >= start && lastSpan.end <= end) {
          lastSpan.end = end;
        } else if (lastSpan.end >= start && lastSpan.end > end) {
          return
        } else {
          freeTime.start = start;
          freeTime.end = end;
          freeTime.split = split;
          rangeFreeTime.push(freeTime);
        }
      } else {
        freeTime.start = start;
        freeTime.end = end;
        freeTime.split = split;
        rangeFreeTime.push(freeTime);
      }


    });
    for (let j = 0; j < employeesArr.value.length; j++) {
      const busyTime: ScheduleEvent = {
        start: date + ' ' + newStart,
        end: date + ' ' + newEnd,
        title: '',
        class: 'not_working_hours',
        background: true,
        split: employeesArr.value[j].id,
        resizable: false
      };
      unavailableSlots.push(busyTime)
    }
  }
  freeTimeSpans.value = rangeFreeTime

  for (let i = 0; i < rangeFreeTime.length - 1; i++) {
    const busyTime: ScheduleEvent = {
      start: rangeFreeTime[i].start.slice(0, -6) + ' ' + newStart,
      end: rangeFreeTime[i].end.slice(0, -6) + ' ' + newEnd,
      title: '',
      class: 'not_working_hours',
      background: true,
      split: '',
      resizable: false
    };
    let currEl = rangeFreeTime[i]
    let foundedSpans = spansInSplit(unavailableSlots, currEl.split, currEl.start.slice(0, -6))

    if (foundedSpans.length > 0) {
      const lastSpan = foundedSpans[foundedSpans.length - 1];
      if (currEl.start >= lastSpan.start) {
        lastSpan.end = currEl.start
        busyTime.start = currEl.end
        busyTime.split = currEl.split
        unavailableSlots.push(busyTime)
      }
    }

  }

  events.value = unavailableSlots
}


const buildMonthScheduler = (ts) => {
  const start = performance.now()
  monthView.value = [];
  const dates: string[] = Object.keys(ts);
  const times: ScheduleTimespanItem[][] = Object.values(ts);
  const monthViewSet = new Set<ScheduleEvent>();

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const timeItems = times[i];

    if (timeItems.length > 0) {
      let quantity = 0;
      let list: { id: string, title: string, quantity: number, duration: number }[] = [];

      for (let ind = 0; ind < timeItems.length; ind++) {
        const item = timeItems[ind];
        const nextItem = timeItems[ind + 1];
        const dayTimeSpan = timeOfDay(item.timespan!.time);
        const dayTimeSpanNext = nextItem ? timeOfDay(nextItem.timespan!.time) : null;
        const isSameDayTime = dayTimeSpan == dayTimeSpanNext;
        const {start, end} = hoursSpanAdder(dayTimeSpan);

        const adderFunc = (cond: boolean) => {
          if (cond) {
            quantity++
            list = addToListOfProds(list, item);
          }
          if (!isSameDayTime) {
            let status = crtStatus(quantity);
            monthViewSet.add(new ScheduleEvent(date, date, list, dayTimeSpan, start, end, status))
            quantity = 0
            list = []
          }
        }
        const adderDefFunc = () => {
          quantity++
          list = addToListOfProds(list, item);
          let status = crtStatus(quantity);
          if (!isSameDayTime) {
            monthViewSet.add(new ScheduleEvent(date, date, list, dayTimeSpan, start, end, status))
            quantity = 0
            list = []
          }
        }
        if (selectedSchedulerItemGroup.value) {
          if (products.value.length > 0 && !(employees.value.length > 0)) {
            adderFunc(hasProdInTimes(products.value, item))
          } else if (employees.value.length > 0 && !(products.value.length > 0)) {
            adderFunc(hasEmplsInTimes(employees.value, item))
          } else if (products.value.length > 0 && employees.value.length > 0) {
            adderFunc(hasEmplsInTimes(employees.value, item) && hasProdInTimes(products.value, item))
          } else {
            adderDefFunc();
          }
        } else {
          adderDefFunc();
        }
      }
    }
  }
  monthView.value = Array.from(monthViewSet);
  console.log(performance.now() - start)
}


const hoursSpanAdder = (daytime) => {
  let start = 0
  let end = 0

  if (daytime === 'Утро') {
    start = 6
    end = 12
  }
  if (daytime === 'День') {
    start = 12
    end = 17
  }
  if (daytime === 'Вечер') {
    start = 17
    end = 21
  }

  return {start, end}
}

const crtStatus = (q) => {
  let sts = ''
  if (q > 0) {
    sts = 'available'
  } else {
    sts = 'none'
  }
  return sts;
}

const addToListOfProds = (arr, i) => {
  i.products?.forEach((product) => {
    const existingProduct = arr.find((prod) => prod.id === product);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      arr.push({id: product, title: '', quantity: 1, duration: 0});
    }
  });
  return arr;
}

let durationCondition = ref<number | null>(null)

const hasEmplsInTimes = (arr, i) => positions.value.some((pos) => arr.some(empl => empl.id === pos.employee) && pos.id === i.position);

const hasProdInTimes = (arr, i) => arr.some(prod => i.products?.includes(prod.id!) && (prod.duration <= (durationCondition.value ? durationCondition.value : i.timespan.duration)));

const timeOfDay = (mins: number) => {
  if (mins < 720) {
    return 'Утро'
  }

  if (mins < 1080) {
    return 'День'
  }

  if (mins < 1440) {
    return 'Вечер'
  }

}

const filterItems = async () => {
  if (products.value.length && !employees.value.length) {
    employeesArr.value = await filterOtherField(products.value, currRangeData.value!)
    products.value = products.value.map(productId => productsArr.value.find(product => product.id === productId));
  }
  if (employees.value.length) {
    employees.value = employees.value.map(employeeId => employeesArr.value.find(employee => employee.id === employeeId));
  }
  buildMonthScheduler(currRangeData.value)
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

  buildMonthScheduler(currRangeData.value)
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
  if (ev.view === 'day' || ev.view === 'week') {
    buildRangeScheduler(ev.startDate, ev.endDate)
  }
}

const requestSchedule = async () => {
  schdLoad.value = true
  if (selectedSchedulerItemGroup.value) {
    await getScheduleByItemGroup()
  }
  if (!selectedSchedulerItemGroup.value && (products.value || employees.value)) {
    await getSchedule()
  }
  schdLoad.value = false
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
