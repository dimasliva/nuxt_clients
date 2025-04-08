<template>
  <div class="d-flex flex-nowrap" >
    <wt class="rounded mx-1 vuecal--full-height-delete" style="width: 80%; height: 75vh;" id="scheduler"
        @cell-dblclick="currView === 'month' || currView === 'week' ? false : eventCreator($event)"
        :on-event-create="currView === 'month' ? onEventCreate : null" :showTimeInCells="currView === 'day'"
        @event-focus="currView === 'month' ? openPopUp($event) : false "
        :on-event-click="currView === 'month' ? openCurrDay : editEvent"
        :cell-click-hold="false" :time-from="startDayHours * 60" :time-to="endDayHours * 60" :snap-to-time="15"
        :time-step="timeStep" ref="vuecal" @event-delete="deleteEvent($event)"
        v-model:active-view="currView" hide-view-selector locale="ru" :special-hours="specialHours"
        :editable-events="currView === 'month' ? false : { title: false, drag: true, resize: false, delete: true, create: true }"
        :events="currView === 'month' ? monthView : events" :split-days="employeesArr" sticky-split-labels
        events-on-month-view="short" :disable-views="['year', 'years', 'week']" :drag-to-create-event="false"
        @view-change="onViewChange($event)" :selected-date="selDate" :min-date="monthViewMinDate"
        :max-date="monthViewMaxDate">
      <template #title="{ view }">
        <span v-if="view.id === 'month'">С {{ view.firstCellDate.format('DD.MM.YYYY') }} по {{ view.lastCellDate.format('DD.MM.YYYY') }}
          <v-btn variant="text" icon="mdi-calendar-today" @click="changeDate(new Date())"></v-btn>
        </span>
      </template>
      <template v-if="currView === 'month'" #event="{ event }">
        <div class="vuecal__event-title">{{ event.title }}</div>
        <v-menu activator="parent" location="top" close-on-content-click max-width="800">
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
      <template v-if="currView !== 'month'" #event="{ event }">
        <div class="custom-event">
          <span>{{ event.title }}</span>
          <v-menu activator="parent" :open-on-hover="event.class !== 'not_working_hours'" max-width="300">
            <v-card class="pa-0">
              <v-card-title class="d-flex ma-0 pa-0">
                <v-spacer></v-spacer>
                <v-btn size="small" variant="text" icon="mdi-calendar-edit" @click="rescheduleEvent(event)"></v-btn>
                <v-btn size="small" variant="text" icon="mdi-delete" @click="deleteEvent(event)"></v-btn>
              </v-card-title>

              <v-card-text @click="editEvent(event)" style="cursor: pointer;">
                <p>{{event.start.formatTime('HH:mm') + ' - ' + event.end.formatTime('HH:mm')}}</p>
                <p>{{event.client.surname + " " + event.client.name + " " + event.client.patronymic}}</p>
                <p>{{event.content}}</p>
              </v-card-text>
            </v-card>
          </v-menu>
        </div>
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
                      v-model="products" label="Услуга" :menu-props="{ scrollStrategy: 'close', minWidth: '300px', maxWidth: '300px' }"
                      :items="selectedSchedulerItemGroup || employees.label ? productsArr : []" item-value="id"
                      :finderDataProvider="productFinderDataProvider" width="auto"
                      @update:model-value="(selectedSchedulerItemGroup || employees.title)? filterItems() : requestSchedule()"/>

          <InputField :type="EDataType.strictstring" :state="fieldsOptions" :disabled="!products.length" hide-details class="my-2 pa-0" density="compact"
                      :items="kindOfDuration" item-value="time" v-model="productsDuration"
                      @update:model-value="filterProducts()" variant="underlined"
                      label="Искать по:"/>

          <InputField customVariant="underlined" :state="fieldsOptions" hide-details class="my-2 pa-0" density="compact"
                      :type="selectedSchedulerItemGroup || products.length ? EDataType.strictstringarray : EDataType.referenceMultiple"
                      v-model="employees" label="Сотрудники" :items="employeesArr" item-title="label" item-value="id"
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
  <div v-if=" currView == 'day' " class="custom-scroll">
    <div class="overflow-el"></div>
  </div>
  <v-progress-linear v-if="schdLoad" color="primary" indeterminate rounded></v-progress-linear>
</template>

<script setup lang="ts">
// @ts-nocheck
import VueCal from 'vue-cal';
import * as Utils from '~/src/common/lib/Utils';
import {EDataType} from '~/src/common/lib/globalTypes';
import InputField from '~/src/widgets/Layers/InputField.vue';
import wt from '~/src/components/CustomMonthView/vue-cal-m';
import type {MoApiClient} from '~/src/common/lib/MoApi/MoApiClient';
import '~components/customMonthView/custom-cal-style.scss';
import EventDialog from '~forms/WindowDialogs/~sub/EditWindowDialogs/~sub/EventDialog.vue';
import {RecordsStore} from '~/src/common/lib/MoApi/Records/RecordsStore';
import type {IFrameHeaderData, PageMap} from '~/src/common/lib/PageMap';
import {PositionsViews} from '~/src/common/lib/MoApi/Views/PositionsViews';
import {EmployeeRecord} from '~/src/common/lib/MoApi/Records/EmployeeRecord';
import {ScheduleEvent} from '~/src/components/CustomMonthView/SchedulerTypes';
import type {IApiDataListResult, IApiResult} from '~/src/common/lib/MoApi/RequestResults';
import {ProductsCatalogRecord} from '~/src/common/lib/MoApi/Records/ProductsCatalogRecord';
import {ScheduleApiSection, type TDatedScheduleTimespanItems} from '~/src/common/lib/MoApi/ApiSectionsV1/SchedulerApiSection';
import {ClientContactsRecord} from "~/src/common/lib/MoApi/Records/ClientContactsRecord";
import {ProductRecord, ProductRecordData} from '~/src/common/lib/MoApi/Records/ProductRecord';
import {BookingsViews, type IBookingListView} from '~/src/common/lib/MoApi/Views/BookingViews';
import {PositionRecord, PositionRecordData} from '~/src/common/lib/MoApi/Records/PositionRecord';
import type ScheduleTimespanItem from '~/src/common/lib/MoApi/Records/DataEntities/ScheduleTimespanItem';
import {ProductFinderDataProvider} from '~/src/ui_tools/FinderDataProviders/~sub/ProductFinderDataProvider';
import {EmployeeFioFinderDataProvider} from '~/src/ui_tools/FinderDataProviders/~sub/EmployeeFioFinderDataProvider';
import {ScheduleItemGroupFinderDataProvider} from '~/src/ui_tools/FinderDataProviders/~sub/ScheduleItemGroupFinderDataProvider';
import {ScheduleItemGroupData, ScheduleItemGroupRecord} from '~/src/common/lib/MoApi/Records/ScheduleItemGroupRecord';
import {
  BookingGridInfo,
  ScheduleGrid,
  ScheduleGridInfo,
  ScheduleGridOptions,
  type TGridQuerySch
} from '~/src/common/lib/Booking/ScheduleGrid';
import {BookingRecord} from "~/src/common/lib/MoApi/Records/BookingRecord";
import {Scheduler} from "~/src/components/CustomMonthView/scheduler";
import {Bookings} from "~/src/common/lib/Booking/Bookings";
import UnscheduledEventDialog from "~forms/WindowDialogs/~sub/EditWindowDialogs/~sub/UnscheduledEventDialog.vue";
import {useDelQU, useQU} from "~/src/common/composables/useActionDialog";
import {okToast} from "~/src/common/composables/useToast";
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
let originalEvents = ref()
let originalFreeTimeSpans = ref()
let originalMonthView = ref()
let originalEmployeesArr = ref()
let originalProductsArr = ref()


const productFinderDataProvider = iocc.get(ProductFinderDataProvider);
const emplFioFinderDataProvider = iocc.get(EmployeeFioFinderDataProvider);
const scheduleItemFinderDataProvider = iocc.get(ScheduleItemGroupFinderDataProvider);
scheduleItemFinderDataProvider.init("scheduleItem");
emplFioFinderDataProvider.init("fioEmployee");

let scheduler: Scheduler;

const eventsHandler = (e) => {
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

// Всплывающее окно с расчетом ближайшего доступного времени
const openPopUp = (day_time: ScheduleEvent) => {
  prodsList.value = [];
  let selDate = day_time.start.format('YYYY-MM-DD');
  prodListTitle.value = day_time.start.format('DD.MM.YYYY');

  // Копируем объекты продуктов
  let prods = day_time.products
      .map(el => {
        const product = productsArr.value.find(pr => pr.id === el.id);
        return product ? JSON.parse(JSON.stringify(product)) : null;
      })
      .filter(Boolean);

  // Находим сотрудников, работающих в нужных сплитах
  let splits = Array.from(
      new Set(
          day_time.products
              .map(el => el.split)
              .map(sp => positions.value.find(pos => pos.id === sp)?.employee)
      )
  ).filter(Boolean);

  // Занятые слоты (учитываем пересечения по времени)
  let busyTime = events.value.filter(ev => {
    let evStart = timeToMinutes(ev.start.slice(11)) / 60;
    let evEnd = timeToMinutes(ev.end.slice(11)) / 60;

    return (
        ev.start.slice(0, 10) == selDate &&
        ev.products &&
        splits.includes(ev.split) &&
        (
            (evStart >= day_time.startTime && evStart < day_time.endTime) ||
            (evEnd > day_time.startTime && evEnd <= day_time.endTime) ||
            (evStart <= day_time.startTime && evEnd >= day_time.endTime)
        )
    );
  });

  // Свободные слоты (полностью в диапазоне)
  let availableTimes = freeTimeSpans.value.filter(ev => {
    let evStart = timeToMinutes(ev.start.slice(11)) / 60;
    let evEnd = timeToMinutes(ev.end.slice(11)) / 60;

    return (
        ev.start.slice(0, 10) == selDate &&
        evStart >= day_time.startTime &&
        evEnd <= day_time.endTime
    );
  });

  // Поиск ближайшего времени
  prodsList.value = scheduler.findNearestTime(day_time, prods, availableTimes, busyTime);

  // Заполняем недостающие данные
  prodsList.value = prodsList.value.map(pr => {
    if (!pr.time || !pr.start) {
      let prod = day_time.products.find(p => p.id == pr.id);
      if (!prod) return pr;

      let position = positions.value.find(pos => pos.id == prod.split);
      if (!position || !position.employee) return pr;

      let findSplit = position.employee;
      let fitProd = prodsList.value.find(p => p.split == findSplit && p.time);
      if (fitProd) {
        pr.split = findSplit;
        pr.time = fitProd.time;
        pr.start = fitProd.start;
      }
    }
    return pr;
  });
};

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
  let del = await useDelQU('Удалить бронь?')
  if(del){
    let rec = await recStore.get<BookingRecord>(BookingRecord, ev.id)
    let res = await rec.delete()
    if(res){
      events.value = events.value.filter(el => el.id !== ev.id)
    }
  }
}

const eventCreator = async (ev) => {
  let newEvent = {
    start: ev.date,
    end: ev.date,
    split: ev.split.toString(),
    title: 'Новая запись',
    duration: quantum.value,
    class: 'rounded',
    content: 'Название услуги',
  };
  let rec = await eventDialog(newEvent)

  if (rec.products.length > 0){
    okToast("Бронь создана")
    vuecal.value.createEvent(rec.start, rec.duration, rec);
  }

}

const eventDiagFromMonth = async(i) => {
  let event = {
    start: new Date(i.start),
    end: new Date(i.start),
    date: new Date(i.start),
    split: i.split.toString(),
    title: 'Новая запись',
    duration: i.duration,
    class: 'rounded',
    content: i.title,
    quick: true
  }

  let rec = await eventDialog(event)

  if (rec.products.length > 0){
    okToast("Бронь создана")
    vuecal.value.createEvent(rec.start, rec.duration, rec);
  }
}

const onEventCreate = (event, deleteEventFunction) => {
  let newEv = event;
  deleteEventFunction();
  newEv.start = newEv.start.format('YYYY-MM-DD hh:mm');
  newEv.end = newEv.end.format('YYYY-MM-DD hh:mm');
  events.value.push(newEv)
}

const eventDialog = async (event, creating: boolean = true) => {
  let currDate = event.start.format('YYYY-MM-DD')
  let split = event.split
  let foundedSpans = spansInSplit(freeTimeSpans.value, split, currDate)
  let foundedProducts = [...new Set(foundedSpans.map(el => el.products).flat())]
  currEvent.value = event;

  if(event.class === 'not_working_hours'){
    let res = await useQU('Создать запись вне расписания?')
    creating = res
  }

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

  if(fitSpan || !creating || event.class === 'not_working_hours'){
    if(fitSpan.end < event.end){
      event.end = fitSpan.end
    }

    return new Promise(resolve => {
      openDialog(EventDialog, {
        event: currEvent.value,
        schGrid: {start: minDate.value, end: maxDate.value},
        scheduler: scheduler,
        // employees: employeesArr.value,
        // positions: positions.value,
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
    errToast('Невозможно создать запись на выбранную дату')
  }

  event = currEvent.value;
  return event
}

const editEvent = async (event) => {

  let rec = await eventDialog(event, false);
  if(rec.deleting){
    events.value = events.value.filter(el => el.id !== rec.id)
  }
  // await requestSchedule()
}

const rescheduleEvent = async (event) => {
  let prods = productsArr.value.filter(product => event.products.includes(product.id));
  await scheduler.getScheduler(minDate.value.format('YYYY-MM-DD'), maxDate.value.format('YYYY-MM-DD'), null, event.products);
  let newEndDate = new Date(minDate.value.getTime());
  newEndDate.setDate(newEndDate.getDate() + 14);
  let events = scheduler.buildRangeScheduler();
  let booking = new Bookings(minDate.value, maxDate.value, scheduler.positions);
  events.unavailableSlots.push(...await booking.getBookingsRecs())

  let busyTime = events.unavailableSlots
  let availableTimes = events.availableSlots
  let quickDate: ScheduleEvent = {
    end: "",
    products: event.products,
    start: undefined,
    startTime: 0,
    title: "",
    endTime: 21
  }
  const availableTimesArr = scheduler.findNearestTime(event, prods, availableTimes, busyTime, false)

  console.log(availableTimesArr)
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

const filterItems = () => {
  if (!products.value.length && !employees.value.length) {
    // Если фильтры сброшены — восстанавливаем оригинальные массивы
    events.value = originalEvents.value;
    freeTimeSpans.value = originalFreeTimeSpans.value;
    monthView.value = originalMonthView.value;
    employeesArr.value = originalEmployeesArr.value;
    productsArr.value = originalProductsArr.value;
    return;
  }

  let filteredEvents = originalEvents.value;
  let filteredFreeTimeSpans = originalFreeTimeSpans.value;
  let filteredMonthView = originalMonthView.value;

  const selectedProductIds = products.value;
  const selectedEmployeeIds = employees.value;

  const isFilteringProducts = selectedProductIds.length > 0;
  const isFilteringEmployees = selectedEmployeeIds.length > 0;

  // Фильтруем данные по выбранным услугам
  if (isFilteringProducts) {
    filteredEvents = filteredEvents.filter(event =>
        event.products.some(p => selectedProductIds.includes(p.id))
    );

    filteredFreeTimeSpans = filteredFreeTimeSpans.filter(slot =>
        slot.products.some(p => selectedProductIds.includes(p.id))
    );

    filteredMonthView = filteredMonthView.filter(item =>
        item.products.some(p => selectedProductIds.includes(p.id))
    );
  }

  // Фильтруем данные по выбранным сотрудникам
  if (isFilteringEmployees) {
    filteredEvents = filteredEvents.filter(event =>
        selectedEmployeeIds.includes(event.split)
    );

    filteredFreeTimeSpans = filteredFreeTimeSpans.filter(slot =>
        selectedEmployeeIds.includes(slot.split)
    );

    filteredMonthView = filteredMonthView.filter(item =>
        item.products.some(p => selectedEmployeeIds.includes(p.split))
    );
  }

  // Обновляем списки сотрудников и услуг
  const newProducts = new Set<string>();
  const newEmployees = new Set<string>();

  const allFilteredItems = [...filteredEvents, ...filteredFreeTimeSpans, ...filteredMonthView];

  allFilteredItems.forEach(item => {
    item.products?.forEach(product => {
      newProducts.add(product.id);
      if (product.split) newEmployees.add(product.split);
    });
    if (item.split) newEmployees.add(item.split);
  });

  employeesArr.value = isFilteringProducts
      ? originalEmployeesArr.value.filter(e => newEmployees.has(e.id))
      : originalEmployeesArr.value;

  productsArr.value = isFilteringEmployees
      ? originalProductsArr.value.filter(p => newProducts.has(p.id))
      : originalProductsArr.value;

  const productsForMonthView = isFilteringProducts
      ? originalProductsArr.value.filter(p => selectedProductIds.includes(p.id))
      : productsArr.value;

  const employeesForMonthView = isFilteringEmployees
      ? originalEmployeesArr.value.filter(e => selectedEmployeeIds.includes(e.id))
      : employeesArr.value;

  // Обновляем данные
  events.value = filteredEvents;
  freeTimeSpans.value = filteredFreeTimeSpans;
  monthView.value = scheduler.buildMonthScheduler(employeesForMonthView, productsForMonthView);
};

const clearFilters = () => {
  employeesArr.value = [];
  productsArr.value = [];
  employees.value = [];
  products.value = [];
  division.value = [];
  changeDate(new Date)
  filterItems()
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
  else if(ev.view === 'day'){
    nextTick(() =>{
      const headerScroll = document.querySelector('.vuecal__flex.vuecal__split-days-headers')
      const bodyScroll  = document.querySelector('.vuecal__flex.vuecal__cells.day-view .vuecal__flex')
      const overflowEl = document.querySelector('.overflow-el')
      const customScroll = document.querySelector('.custom-scroll')

      if(overflowEl && bodyScroll && headerScroll && customScroll){
        overflowEl.style.width = bodyScroll.scrollWidth + 'px';

        customScroll.addEventListener('scroll', function() {
          bodyScroll.scrollLeft = customScroll.scrollLeft;
          headerScroll.scrollLeft = customScroll.scrollLeft;
        });

        bodyScroll.addEventListener('scroll', function() {
          headerScroll.scrollLeft = bodyScroll.scrollLeft;
          customScroll.scrollLeft = bodyScroll.scrollLeft;
        });

        headerScroll.addEventListener('scroll', function() {
          bodyScroll.scrollLeft = headerScroll.scrollLeft;
          customScroll.scrollLeft = headerScroll.scrollLeft;
        });
      }
    })
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

    let data = res.buildRangeScheduler();
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

  originalEvents.value = events.value;
  originalFreeTimeSpans.value = freeTimeSpans.value ;
  originalMonthView.value = monthView.value;
  originalEmployeesArr.value = employeesArr.value;
  originalProductsArr.value = productsArr.value;
  console.log(originalEvents.value)
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

pageMap.setPageData("/booking/test_journal", pageMapData);

defineExpose({eventsHandler});

</script>

<style scoped>
.custom-scroll{
  margin-right: 20%;
  overflow-y: hidden;
  overflow-x: scroll;
}

.overflow-el{
  height: 1px;
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

.not_working_hours {
  background-color: #929090;
}

.separator {
  background-color: #c0c0c049;
  z-index: 0;
}

</style>
