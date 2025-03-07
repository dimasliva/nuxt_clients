<template>
  <FormsEditWindowDialog title="Выберите новое время для записи" :on-save="" :on-close="" :readonly="false">
    <QuickTimeOffer :schedule-data="props.scheduleData"></QuickTimeOffer>
  </FormsEditWindowDialog>
</template>

<script setup lang="ts">
import {ScheduleEvent} from "~/components/customMonthView/SchedulerTypes";

interface Props {
  eventData: ScheduleEvent;
  scheduleData: ScheduleEvent[];
}

const props = defineProps<Props>()

</script>

