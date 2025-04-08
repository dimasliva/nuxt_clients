<template>
  <v-card flat>
    <v-card-title class="text-subtitle-1">ВЫБЕРИТЕ ВРЕМЯ</v-card-title>
    <v-list class="border-md rounded-lg">
      <v-list-item  v-for="slot in freeTimeQuicks" :key="slot.date">
        <v-list-item-title> {{slot.date}} - {{slot.employee}} </v-list-item-title>
        <v-list-item-action class="d-flex flex-wrap">
          <v-btn v-for="time in slot.freeSlots" rounded="xl" variant="outlined" color="primary" class="ma-1" @click="onSlotSelect(slot, time)">{{ time }}</v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">

import {ScheduleEvent} from "~/src/components/CustomMonthView/SchedulerTypes";
import {RecordsStore} from "~/src/common/lib/MoApi/Records/RecordsStore";
import {EmployeeRecord} from "~/src/common/lib/MoApi/Records/EmployeeRecord";

interface Props {
  scheduleData: ScheduleEvent[];
}

const findEmployeeById = async (data: ScheduleEvent[]) => {
  const uniqueSplits: any[] = [];
  data.forEach(item => {
    if (!uniqueSplits.includes(item.split)) {
      uniqueSplits.push(item.split);
    }
  });
  let res = await recStore.getRecords<EmployeeRecord>(EmployeeRecord, uniqueSplits);
  return res.map(e => e.MData)
}

const props = defineProps<Props>()
const iocc = useContainer();
const recStore = iocc.get(RecordsStore);
const emit = defineEmits(["selectedSlot", "changed"])
const employees = ref()
let freeTimeQuicks = ref()

const createScheduleForRendering = async() => {
  employees.value = await findEmployeeById(props.scheduleData)
  const scheduleForRendering: any[] = [];

  props.scheduleData.forEach(schedule => {
    const employee = employees.value.find(emp => emp.id === schedule.split);
    if (employee) {
      const date = new Date(schedule.start);
      const formattedDate = date.toLocaleDateString('DD.MM.YYYY');
      const fullName = `${employee.name} ${employee.surname} ${employee.patronymic.charAt(0)}.`;
      const freeSlots = props.scheduleData.filter(d => d.start.slice(0, 10) === schedule.start.slice(0, 10) && d.split === schedule.split).map(slot => slot.start.slice(11));

      if (!scheduleForRendering.some(el => el.date === formattedDate && el.employee === fullName)) {
        scheduleForRendering.push({
          date: formattedDate,
          employee: fullName,
          employeeId: schedule.split,
          freeSlots: freeSlots
        });
      }
    }
  });

  freeTimeQuicks.value = scheduleForRendering
}

createScheduleForRendering()

const onSlotSelect = (sl, tm) => {
  emit('selectedSlot', {sl, tm})
}
</script>
