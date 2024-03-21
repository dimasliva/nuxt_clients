<template>
  <v-row style="height: 75vh; overflow-y: auto;" class="ma-1 flex-nowrap">
    <wt :on-event-create="onEventCreate" @cell-dblclick="cumstomEventCreator($event)"
      @event-mouse-enter="openPopUp($event)" :on-event-click="currView === 'month' ? openCurrDay : editEvent"
      :cell-click-hold="false" :time-to="21 * 60" :snap-to-time="5" :time-step="30" ref="vuecal" class="rounded"
      v-model:active-view="currView" hide-view-selector locale="ru" :special-hours="specialHours"
      :editable-events="currView === 'month' ? false : { title: false, drag: true, resize: true, delete: true, create: true }"
      :events="currView === 'month' ? monthView : events" :split-days="employeesArr" sticky-split-labels
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
        <v-tooltip location="end" activator="parent">
          <v-card density="compact" variant="outlined">
            <v-card-title>
              {{ prodListTitle }}
            </v-card-title>
            <v-card-text>
              <v-list density="compact" variant="text" bg-color="#FFFFFF00">
                <v-list-item v-for="(item) in prodsList">
                  <v-list-item-title>{{ item.title }}: {{ item.quantity }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-tooltip>
      </template>
    </wt>
    <v-expand-x-transition>
      <VCard v-show="drawer" class="mb-auto mx-1" max-width="20vw">
        <VForm>
          <VCol>
            <v-row class="text-body-1 ma-2" style="min-width: 200pt;">Фильтровать по: <v-spacer></v-spacer><v-icon
                @click="drawer = false">mdi-close</v-icon></v-row>

            <v-text-field v-model="dateRange" label="Диапазон дат" readonly variant="underlined" density="compact"
              :loading="schdLoad" append-inner-icon="mdi-calendar-month" @click:control="monthViewDates(false)">
              <v-menu v-model="dataPickerMenu" :close-on-content-click="false" activator="parent">
                <v-card>
                  <v-card-text class="pa-1">
                    <vue-cal id="datapicker" class="vuecal--date-picker" xsmall hide-view-selector :time="false"
                      active-view="month" :disable-views="['day', 'week', 'year', 'years']" locale="ru"
                      :min-date="minDate" :max-date="maxDate" @cell-click="changeDate($event)"
                      style="width: 300px; min-height: 230px; background-color: white; border-radius: 10px; text-align: center;">
                    </vue-cal>
                  </v-card-text>
                </v-card>
              </v-menu>
            </v-text-field>

            <v-combobox v-model="selectedSchedulerItemGroup" density="compact" label="Раздел расписания"
              :loading="schdLoad" :items="schedulerItemGroups" item-title="title" variant="underlined"
              :disabled="(!!employees.length && !selectedSchedulerItemGroup?.title) || (!!products.length && !selectedSchedulerItemGroup?.title)"></v-combobox>

            <!-- <v-combobox chips closable-chips multiple v-model="products" density="compact" label="Услуга"
              :loading="prodsLoad" :items="productsArr" variant="underlined" @update:menu="filterDays($event)" @click="employees.length || selectedSchedulerItemGroup ? false : openDialog(SearchProductDilaog, {
                title: 'Поиск товаров и услуг', full: 'Выбрать из прайс-листа', text_field: 'Товар или услуга', reqAction: searchProds, prices: true, action:
                  (p) => { products = p }
              })">
            </v-combobox> -->

            <InputField variant="underlined" :state="fieldsOptions" chips closable-chips
              :type="employees.length || selectedSchedulerItemGroup ? EDataType.strictstringarray : EDataType.referenceMultiple"
              v-model="products" label="Услуга" :items="productsArr" item-value="id"
              :finderDataProvider="productFinderDataProvider" @update:model-value="filterDays($event)" />

            <v-expand-transition>
              <v-select v-if="products.length" :items="kindOfDuration" item-title="title" item-value="time"
                v-model="productsDuration" @update:menu="filterProducts($event)" density="compact" variant="underlined"
                label="Искать по:"></v-select>
            </v-expand-transition>

            <v-combobox chips closable-chips multiple v-model="employees" density="compact" label="Сотрудник"
              @update:menu="filterDays($event)" :loading="empLoad" :items="employeesArr" item-title="title"
              item-value="id" variant="underlined" @click=" products.length || selectedSchedulerItemGroup ? false : openDialog(SearchProductDilaog, {
                title: 'Поиск сотрудника', full: 'Выбрать из списка сотрудников', text_field: 'Иванов Иван Иванович', reqAction: searchEmployee, prices:
                  false, action: (e) => { employees = e }
              })"></v-combobox>

            <v-combobox v-model="division" density="compact" label="Филиал" :items="divisions" item-title="label"
              item-value="id" variant="underlined"
              :disabled="!employees.length && !products.length && !selectedSchedulerItemGroup"></v-combobox>

            <v-card-actions style="min-width: 200pt;">
              <VBtn variant="text" @click="getScheduleByItemGroup()">Поиск</VBtn>
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
import type { IFrameHeaderData, PageMap } from '~~/lib/PageMap';
import { QueryParams, QueryParamsScheduler, QueryProductFtsList } from '~~/lib/MoApi/RequestArgs';
import { ProductFtsViews, type IProductFtsListView } from '~/lib/MoApi/Views/ProductFtsListView';
import { EmployeesViews, type IEmployeeListView } from '~~/lib/MoApi/Views/EmployeesViews';
import { ScheduleItemGroupData, ScheduleItemGroupRecord } from '~/lib/MoApi/Records/SchedulerItemGroupRecord';
import { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import type { MoApiClient } from '~/lib/MoApi/MoApiClient';
import type { IApiDataListResult, IApiResult } from '~/lib/MoApi/RequestResults';
import { ScheduleEvent } from '~/components/customMonthView/SchedulerTypes';
import { ProductRecord, ProductRecordData } from '~/lib/MoApi/Records/ProductRecord';
import type ScheduleTimespanItem from '~/lib/MoApi/Records/DataEntities/ScheduleTimespanItem';
import { PositionRecord, PositionRecordData } from '~/lib/MoApi/Records/PositionRecord';
import { EmployeeRecord } from '~/lib/MoApi/Records/EmployeeRecord';
import { ProductFinderDataProvider } from '~/libVis/FinderDataProviders/ProductFinderDataProvider';
import { EDataType } from '~/lib/globalTypes';
import { ProductsCatalogRecord } from '~/lib/MoApi/Records/ProductsCatalogRecord';

//__________________________VVV Статичные данные, удалить при работе с API VVV

let status = ref([
  { icon: 'mdi-account', title: 'Контакт' },
  { icon: 'mdi-pencil', title: 'Предварительная запись' },
  { icon: 'mdi-email', title: 'Напоминание' },
  { icon: 'mdi-phone', title: 'Лид' },
])

let kindOfDuration = ref([
  { time: 'short', title: 'Самой короткой' },
  { time: 'long', title: 'Самой длинной' },
  { time: 'sum', title: 'Сумме длительностей' },
])
//__________________________^^^ Статичные данные, удалить при работе с API ^^^

const iocc = useContainer();
const recStore = iocc.get(RecordsStore);
const apiClient = iocc.get<MoApiClient>('MoApiClient');
const pageMap = iocc.get<PageMap>("PageMap");
let currView = ref('month');
let dataPickerMenu = ref(false);
let schedulerItemGroups = ref<any>([])

const fieldsOptions = reactive({
  errCnt: 0,
  changedCnt: 0,
  readonly: false
})

let specialHours = ref({ 7: { from: 6 * 60, to: 21 * 60, class: 'not_working_hours', title: '' } })
let divisions = ref([])
let monthView = ref<ScheduleEvent[]>([])
let events = []
let vuecal = ref<any>(null);
let products = ref<ProductRecordData[]>([])
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
let selectedSchedulerItemGroup = ref<ScheduleItemGroupData>()
const employeesViews = iocc.get(EmployeesViews);
const productsView = iocc.get(ProductFtsViews);
let rangeSelected = ref(false)
let minDate = ref<any>('')
let maxDate = ref<any>('')
let monthViewMinDate = ref<any>(new Date())
let monthViewMaxDate = ref<any>('')
let selDate = ref(monthViewMinDate.value)
let dateRange = ref('')
let currRangeData = ref<any>()
let prodsLoad = ref(false)
let schdLoad = ref(false)
let empLoad = ref(false)
let productsDuration = ref()
let isProdsList = ref(false)
let prodsList = ref<any>([])
let prodListTitle = ref<any>('')

const productFinderDataProvider = iocc.get(ProductFinderDataProvider);

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

let catalogs = ref<any>([])
const getCatalogList = async (keys) => {
  let list = await recStore.getRecordsM(keys.map((k) => {
    return { id: { key: k, type: ProductsCatalogRecord } }
  }));
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
  day_time.products.map((product) => {
    const foundProduct = productsArr.value.find((prod) => prod.id === product.id);
    if (foundProduct !== undefined) {
      product.title = foundProduct.title;
      prodsList.value.push(product);
    }
  });

}

const monthViewDates = (b: boolean) => {
  if (b) {
    selDate.value = minDate.value;
    dateRange.value = `${minDate.value.format('DD.MM.YYYY')}-${maxDate.value.format('DD.MM.YYYY')}`;
  } else {
    monthViewMinDate.value = new Date();
    monthViewMaxDate.value = '';
    minDate.value = '';
    maxDate.value = '';
    dateRange.value = '';
    rangeSelected.value = false;
    selDate.value = monthViewMinDate.value;
  }
  dataPickerMenu.value = false
}

const changeDate = (date) => {
  minDate.value = new Date(date);
  maxDate.value = new Date(date);
  maxDate.value.setDate(maxDate.value.getDate() + 30)
  monthViewDates(true);
}

// css стилизация для отображения выбранного диапазона
const onDatePicker = () => {
  let cells: HTMLElement[] = []
  setTimeout(() => {
    let datapicker = document.getElementById('datapicker');
    let selectedRange: HTMLElement[];
    cells = Array.from(datapicker!.querySelectorAll('.vuecal__cell'));

    if (minDate.value) {
      cells.forEach((day: HTMLElement) => {
        if (!day.className.includes('before-min')) {
          day.classList.add('date-picker-month');
        } else {
          day.classList.remove('date-picker-month');
        }
      })
      selectedRange = Array.from(datapicker!.querySelectorAll('.date-picker-month'));
      selectedRange[0].classList.add('first-day-pick');
    }
    if (maxDate.value) {
      cells.forEach((day: HTMLElement) => {
        if (!day.className.includes('before-min') && !day.className.includes('after-max')) {
          day.classList.add('date-picker-month');
        } else {
          day.classList.remove('date-picker-month');
        }
      })
      selectedRange = Array.from(datapicker!.querySelectorAll('.date-picker-month'));
      selectedRange[selectedRange.length - 1].classList.add('last-day-pick')
    }
    if (!minDate.value && !maxDate.value && rangeSelected.value) {

      selectedRange = Array.from(datapicker!.querySelectorAll('.date-picker-month'));
      selectedRange[0].classList.remove('first-day-pick');
      selectedRange[selectedRange.length - 1].classList.remove('last-day-pick');

      cells.forEach((day: HTMLElement) => {
        day.classList.remove('date-picker-month');
      })
    }
  }, 100)

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
  openDialog(EventDialog, { event: currEvent.value, employees: employeesArr.value, status: status.value, creation: true, mainAction: eventAlteration, delFunc: deleteEventFunction });
  return event
}

const editEvent = (event) => {
  currEvent.value = event;
  openDialog(EventDialog, { event: currEvent.value, employees: employeesArr.value, status: status.value, creation: false, mainAction: eventAlteration, delFunc: event.deleteEventFunction });
  return event
}

const getScheduleItemGroupIds = async () => {
  let recIds = await apiClient.send<string, IApiResult>("/Schedule/FindScheduleItemGroups", "title !=''");
  getScheduleItemGroup(recIds);
}

const getScheduleItemGroup = async (ids) => {
  let recs = await recStore.getRecordsM(ids.map((i) => {
    return { id: { key: i, type: ScheduleItemGroupRecord } }
  }));
  schedulerItemGroups.value = recs.map((i) => i.MData)
}

const getScheduleByItemGroup = async () => {
  monthViewMinDate.value = minDate.value;
  monthViewMaxDate.value = maxDate.value;
  if (selectedSchedulerItemGroup.value) {
    let res = await apiClient.sendRequest("GET",
      `/api/v1/Schedule/GetScheduleByItemGroup?${apiClient._convertToURLParams(new QueryParamsScheduler(minDate.value.format('MM-DD-YYYY'), maxDate.value.format('MM-DD-YYYY'), selectedSchedulerItemGroup.value.id!))}`,
      null,
      null);
    let sch: any = res.bodyData
    currRangeData.value = res.bodyData
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
}

const getProductsList = async (k) => {
  let keys = k.map((id) => id.replaceAll(`'`, `"`))
  let recs = await recStore.getRecordsM(keys.map((i) => {
    return { id: { key: i, type: ProductRecord } }
  }));
  return recs.map((i) => i.MData)
}

const getEmployeeList = async (k) => {
  let keys = k.map((id) => id.replaceAll(`'`, `"`))
  let recs = await recStore.getRecordsM(keys.map((i) => {
    return { id: { key: i, type: PositionRecord } }
  }));
  positions.value = Array.from(recs.map(i => i.MData))
  let emplsRec = recs.map(i => i.MData).map((el: any) => el.employee.replaceAll(`'`, `"`))
  emplsRec = await recStore.getRecordsM(emplsRec.map((i) => {
    return { id: { key: i, type: EmployeeRecord } }
  }));
  return emplsRec.map(i => i.MData)
}

const buildMonthScheduler = (ts) => {
  let dates: string[] = Object.keys(ts);
  let times: ScheduleTimespanItem[][] = Object.values(ts);
  monthView.value = [];
  const monthViewSet = new Set<ScheduleEvent>();

  dates.map((date, i) => {
    if (times[i].length > 0) {
      let quantity = 0;
      let list: { id: string, title: string, quantity: number }[] = [];

      times[i].map((item, ind) => {
        let nextItem = times[i][ind + 1];
        let dayTimeSpan = timeOfDay(item.timespan.time);
        let dayTimeSpanNext = nextItem ? timeOfDay(nextItem.timespan.time) : null;
        let isSameDayTime = dayTimeSpan == dayTimeSpanNext

        const adderFunc = (cond: boolean) => {
          if (cond) {
            quantity++
            list = listOfProds(list, item);
          }
          if (!isSameDayTime) {
            let status = crtStatus(quantity);
            monthViewSet.add(new ScheduleEvent(date, date, list, dayTimeSpan + ': ' + quantity, status))
            quantity = 0
            list = []
          }
        }

        if (products.value.length > 0 && !(employees.value.length > 0)) {
          adderFunc(hasProdInTimes(products.value, item))
        } else if (employees.value.length > 0 && !(products.value.length > 0)) {
          adderFunc(hasEmplsInTimes(employees.value, item))
        } else if (products.value.length > 0 && employees.value.length > 0) {
          adderFunc(hasEmplsInTimes(employees.value, item) && hasProdInTimes(products.value, item))
        } else {
          quantity++
          list = listOfProds(list, item);
          let status = crtStatus(quantity);
          if (!isSameDayTime) {
            monthViewSet.add(new ScheduleEvent(date, date, list, dayTimeSpan + ': ' + quantity, status))
            quantity = 0
            list = []
          }
        }
      })
    }
  })
  monthView.value = Array.from(monthViewSet);
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

const listOfProds = (arr, i) => {
  i.products?.forEach((product) => {
    const existingProduct = arr.find((prod) => prod.id === product);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      arr.push({ id: product, title: '', quantity: 1 });
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
  };
  if (mins < 1080) {
    return 'День'
  };
  if (mins < 1440) {
    return 'Вечер'
  };
}

const filterDays = (opened: boolean) => {
  products.value = products.value.map(productId => productsArr.value.find(product => product.id === productId));
  buildMonthScheduler(currRangeData.value)
}

const filterProducts = (opened: boolean) => {
  if (!opened) {
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
}

// сброс фильтров поиска бокового меню
const clearFilters = () => {
  employeesArr.value = [];
  productsArr.value = [];
  selectedSchedulerItemGroup.value = undefined;
  employees.value = [];
  products.value = [];
  division.value = [];
  monthViewDates(false)
  monthView.value = [];
}


const onViewChange = ({ view }) => {
  if (view === 'month') {
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

let pageMapData: IFrameHeaderData = reactive({
  title: "Журнал предварительной записи", icon: "", mainBtnBar: [
    { id: "day", title: "День", icon: "", disabled: false, color: "secondary", bkgColor: "red", action: () => currView.value = 'day' },
    { id: "month", title: "Неделя", icon: "", disabled: false, color: "secondary", bkgColor: "red", action: () => currView.value = 'week' },
    { id: "month", title: "Месяц", icon: "", disabled: false, color: "secondary", bkgColor: "red", action: () => currView.value = 'month' },
    { id: "filterBtn", title: "", icon: "mdi-filter", disabled: false, color: "secondary", bkgColor: "red", action: () => drawer.value = !drawer.value },
  ]
});



getScheduleItemGroupIds();
getCatalogs();

pageMap.setPageData("/administration/test_journal", pageMapData);

defineExpose({ eventsHandler });

</script>
<style>
.vuecal__event {
  margin: 3px auto;
  border-radius: 10px;
  width: 95%;
}

.available {
  background-color: #83ff8163;
}

.unavailable {
  background-color: #c5c5c542;
}

.none {
  display: none;
}

.vuecal--short-events .vuecal__event-title {
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 5px;
  border-radius: 10px;
  margin: 2px;
}

.date-picker-month {
  background-color: rgba(150 255 194 / 35%) !important;
  margin-top: 1px;
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
  background-color: #ffff0000;
  color: black;
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
