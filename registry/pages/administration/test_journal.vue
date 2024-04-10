<template>
    <v-row style="height: 75vh; overflow-y: auto;" class="ma-1 flex-nowrap">
        <wt :on-event-create="onEventCreate" @cell-dblclick="cumstomEventCreator($event)"
            @event-focus="openPopUp($event)" :on-event-click="currView === 'month' ? openCurrDay : editEvent"
            :cell-click-hold="false" :time-to="21 * 60" :snap-to-time="5" :time-step="30" ref="vuecal" class="rounded"
            v-model:active-view="currView" hide-view-selector locale="ru" :special-hours="specialHours"
            :editable-events="currView === 'month' ? false : { title: false, drag: true, resize: true, delete: true, create: true }"
            :events="currView === 'month' ? monthView : events" :split-days="employeesArr" sticky-split-labels
            events-on-month-view="short" :disable-views="['year', 'years']" :drag-to-create-event="false"
            :time-from="6 * 60" @view-change="onViewChange" :selected-date="selDate" :min-date="monthViewMinDate"
            :max-date="monthViewMaxDate"> 
            <template #title="{ title, view }">
                <span v-if="view.id === 'month'">С {{ view.firstCellDate.format('DD.MM.YYYY') }} по {{
            view.lastCellDate.format('DD.MM.YYYY') }}
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
                                    {{ prodListTitle }} <v-btn variant="text" density="compact" v-bind="props">запись на
                                        {{ event.title }}</v-btn>
                                </template>
                                <!-- style="resize: both;" -->
                                <v-card max-height="300" class="pa-4 " max-width="600">
                                    <vue-cal active-view="day" @cell-dblclick="cumstomEventCreator($event)"
                                        :on-event-create="onEventCreate" :split-days="employeesArr" hide-view-selector
                                        hide-title-bar :events="events" :selected-date="selectedCurrDate" locale="ru"
                                        :cell-click-hold="false" :drag-to-create-event="false" :snap-to-time="5"
                                        :time-step="30" ref="vuecal" :time-from="event.startTime * 60"
                                        :time-to="event.endTime * 60" sticky-split-labels style="width: fit-content;">
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
            <VCard v-show="drawer" class="mb-auto mx-1" width="15vw">
                <VForm>
                    <VCol>
                        <v-row class="text-body-1 ma-2" style="min-width: 200pt;">Поиск
                            <v-spacer></v-spacer><v-icon @click="drawer = false">mdi-close</v-icon></v-row>

                        <v-text-field v-model="dateRange" label="Диапазон дат" readonly variant="underlined"
                            density="compact" :loading="schdLoad" append-inner-icon="mdi-calendar-month"
                            @click:control="clearMonthViewDates()">
                            <v-menu v-model="dataPickerMenu" :close-on-content-click="false" activator="parent">
                                <v-card>
                                    <v-card-text class="pa-1">
                                        <vue-cal id="datapicker" class="vuecal--date-picker" xsmall hide-view-selector
                                            :time="false" active-view="month"
                                            :disable-views="['day', 'week', 'year', 'years']" locale="ru"
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

                        <!-- <InputField customVariant="underlined" :state="fieldsOptions" :type="EDataType.referenceMultiple"
              :disabled="(!!employees.length && !selectedSchedulerItemGroup?.title) || (!!products.length && !selectedSchedulerItemGroup?.title)"
              v-model="selectedSchedulerItemGroup" label="Раздел расписания" :items="productsArr"
              :finderDataProvider="scheduleItemFinderDataProvider" /> -->

                        <!-- <InputField customVariant="underlined" :state="fieldsOptions"
                            :type="selectedSchedulerItemGroup ? EDataType.strictstringarray : EDataType.referenceMultiple"
                            v-model="products" label="Услуга" :items="selectedSchedulerItemGroup? productsArr : []" item-value="id"
                            :finderDataProvider="productFinderDataProvider"
                            @update:model-value="() => {if(selectedSchedulerItemGroup)filterDays($event)}" /> -->

                        <InputField customVariant="underlined" :state="fieldsOptions"
                            :type="selectedSchedulerItemGroup || employees.length ? EDataType.strictstringarray : EDataType.referenceMultiple"
                            v-model="products" label="Услуга" :items="selectedSchedulerItemGroup ? productsArr : []"
                            :item-value="'id' || 'value'" :finderDataProvider="productFinderDataProvider"
                            @update:model-value="() => { if (selectedSchedulerItemGroup) { filterDays() } else { getSchedule() }; isProdsList = true }" />


                        <InputField :type="EDataType.strictstring" :state="fieldsOptions" 
                        :items="kindOfDuration" item-value="time" v-model="productsDuration"
                        @update:model-value="filterProducts($event)" variant="underlined"
                        label="Искать по:" />

                        <InputField customVariant="underlined" :state="fieldsOptions"
                            :type="selectedSchedulerItemGroup || products.length ? EDataType.strictstringarray : EDataType.referenceMultiple"
                            v-model="employees" label="Сотрудники" :items="employeesArr" item-value="id"
                            :finderDataProvider="emplFioFinderDataProvider"
                            @update:model-value="() => { if (selectedSchedulerItemGroup) filterDays() }" />

                        <InputField customVariant="underlined" :state="fieldsOptions"
                            :type="selectedSchedulerItemGroup || products.length || employees.length ? EDataType.strictstringarray : EDataType.referenceMultiple"
                            v-model="division" label="Филиал" :items="divisions" item-value="id"
                            :finderDataProvider="emplFioFinderDataProvider"
                            :disabled="!employees.length && !products.length && !selectedSchedulerItemGroup"
                            @update:model-value="selectedSchedulerItemGroup ? filterDays() : false" />

                        <v-card-actions style="min-width: 200pt;">
                            <VBtn variant="text" @click="requestSchedule()">Поиск</VBtn>
                            <VBtn variant="text" @click="clearFilters()">Очистить</VBtn>
                        </v-card-actions>
                    </VCol>
                </VForm>
            </VCard>
        </v-expand-x-transition>
    </v-row>
</template>

<script setup lang="ts">
import VueCal from 'vue-cal';
import { EDataType } from '~/lib/globalTypes';
import InputField from '~/components/InputField.vue';
import wt from '~~/components/customMonthView/vue-cal-m';
import type { MoApiClient } from '~/lib/MoApi/MoApiClient';
import '~~/components/customMonthView/custom-cal-style.scss';
import EventDialog from '~~/components/forms/EventDialog.vue';
import { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import type { IFrameHeaderData, PageMap } from '~~/lib/PageMap';
import { EmployeeRecord } from '~/lib/MoApi/Records/EmployeeRecord';
import { QueryParamsScheduler, QuerySchedule } from '~~/lib/MoApi/RequestArgs';
import type { IApiDataListResult, IApiResult } from '~/lib/MoApi/RequestResults';
import { ScheduleMonthEvent } from '~/components/customMonthView/SchedulerTypes';
import { ProductsCatalogRecord } from '~/lib/MoApi/Records/ProductsCatalogRecord';
import { ScheduleApiSection } from '~/lib/MoApi/ApiSectionsV1/SchedulerApiSection';
import { ProductRecord, ProductRecordData } from '~/lib/MoApi/Records/ProductRecord';
import { PositionRecord, PositionRecordData } from '~/lib/MoApi/Records/PositionRecord';
import type ScheduleTimespanItem from '~/lib/MoApi/Records/DataEntities/ScheduleTimespanItem';
import { ProductFinderDataProvider } from '~/libVis/FinderDataProviders/ProductFinderDataProvider';
import { EmployeeFioFinderDataProvider } from '~/libVis/FinderDataProviders/EmployeeFioFinderDataProvider';
import { ScheduleItemFinderDataProvider } from '~/libVis/FinderDataProviders/ScheduleItemFinderDataProvider';
import { ScheduleItemGroupData, ScheduleItemGroupRecord } from '~/lib/MoApi/Records/SchedulerItemGroupRecord';

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
const schItemGroup = iocc.get(ScheduleApiSection);
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
let monthView = ref<ScheduleMonthEvent[]>([])
let events = []
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
let selectedSchedulerItemGroup = ref<ScheduleItemGroupData>()
let minDate = ref<any>(new Date())
let maxDate = ref<any>(new Date())
maxDate.value.setDate(maxDate.value.getDate() + 30)
let monthViewMinDate = ref<any>(new Date())
let monthViewMaxDate = ref<any>('')
let selDate = ref(monthViewMinDate.value)
let dateRange = ref(`${minDate.value.format('DD.MM.YYYY')}-${maxDate.value.format('DD.MM.YYYY')}`)
let currRangeData = ref<any>()
let prodsLoad = ref(false)
let schdLoad = ref(false)
let empLoad = ref(false)
let productsDuration = ref()
let isProdsList = ref(false)
let prodsList = ref<any>([])
let prodListTitle = ref<any>('')

const productFinderDataProvider = iocc.get(ProductFinderDataProvider);
const emplFioFinderDataProvider = iocc.get(EmployeeFioFinderDataProvider);
const scheduleItemFinderDataProvider = iocc.get(ScheduleItemFinderDataProvider);
scheduleItemFinderDataProvider.init("scheduleItem");
emplFioFinderDataProvider.init("fioEmployyee");

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

const openPopUp = (day_time: ScheduleMonthEvent) => {
    prodsList.value = []
    prodListTitle.value = day_time.start.format('DD.MM.YYYY');
    let foundedTimeSpan = currRangeData.value[day_time.start.format('YYYY-MM-DD')]
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
    dateRange.value = `${minDate.value.format('DD.MM.YYYY')}-${maxDate.value.format('DD.MM.YYYY')}`;
    selDate.value = minDate.value;
    dataPickerMenu.value = false;
    monthViewMinDate.value = minDate.value;
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
        let res = await schItemGroup.getScheduleByItemGroup(minDate.value, maxDate.value, selectedSchedulerItemGroup.value.id!)
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

const getSchedule = async () => {
    let prodsIds: any = null;
    let positionsIds: any = null;
    if (employees.value.length) {
        positionsIds = employees.value.map()
    }
    if (products.value.length) {
        prodsIds = products.value.map((i: any) => i.value)
    }

    let res = await schItemGroup.getSchedule({ begDate: minDate.value, endDate: maxDate.value, productIds: prodsIds, positionIds: null, divisionIds: division.value ? division.value : null, placementIds: null });
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

const buildMonthScheduler = (ts) => {
    monthView.value = [];
    const dates: string[] = Object.keys(ts);
    const times: ScheduleTimespanItem[][] = Object.values(ts);
    const monthViewSet = new Set<ScheduleMonthEvent>();

    dates.forEach((date, i) => {
        if (times[i].length > 0) {
            let quantity = 0;
            let list: { id: string, title: string, quantity: number, duration: number }[] = [];

            times[i].map((item, ind) => {
                let nextItem = times[i][ind + 1];
                let dayTimeSpan = timeOfDay(item.timespan!.time);
                let dayTimeSpanNext = nextItem ? timeOfDay(nextItem.timespan!.time) : null;
                let isSameDayTime = dayTimeSpan == dayTimeSpanNext;
                const { start, end } = hoursSpanAdder(dayTimeSpan);

                const adderFunc = (cond: boolean) => {
                    if (cond) {
                        quantity++
                        list = addToListOfProds(list, item);
                    }
                    if (!isSameDayTime) {
                        let status = crtStatus(quantity);
                        monthViewSet.add(new ScheduleMonthEvent(date, date, list, dayTimeSpan, start, end, status))
                        quantity = 0
                        list = []
                    }
                }
                const adderDefFunc = () => {
                    quantity++
                    list = addToListOfProds(list, item);
                    let status = crtStatus(quantity);
                    if (!isSameDayTime) {
                        monthViewSet.add(new ScheduleMonthEvent(date, date, list, dayTimeSpan, start, end, status))
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
            })
        }
    })
    monthView.value = Array.from(monthViewSet);
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

    return { start, end }
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
            arr.push({ id: product, title: '', quantity: 1, duration: 0 });
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

const filterDays = () => {
    if (products.value.length) {
        products.value = products.value.map(productId => productsArr.value.find(product => product.id === productId));
    }
    if (employees.value.length) {
        employees.value = employees.value.map(employeeId => employeesArr.value.find(employee => employee.id === employeeId));
    }
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
    changeDate(new Date)
    getSchedule();
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

const requestSchedule = async () => {
    if (selectedSchedulerItemGroup.value) {
        await getScheduleByItemGroup()
    }
    if (!selectedSchedulerItemGroup.value && (products.value || employees.value)) {
        await getSchedule()
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
requestSchedule();
pageMap.setPageData("/administration/test_journal", pageMapData);

defineExpose({ eventsHandler });

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
