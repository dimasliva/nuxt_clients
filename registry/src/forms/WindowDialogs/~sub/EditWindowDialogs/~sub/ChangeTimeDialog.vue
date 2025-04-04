<template>
  <EditWindowDialog title="Выберите новое время для записи" :on-save="async()=>{}"  :readonly="false">
    <QuickTimeOffer :schedule-data="props.scheduleData"></QuickTimeOffer>
  </EditWindowDialog>
</template>

<script setup lang="ts">
import {EditWindowDialog} from "./~base/elements/EditWindowDialog";
import {ScheduleEvent} from "~/src/components/CustomMonthView/SchedulerTypes";

interface Props {
  eventData: ScheduleEvent;
  scheduleData: ScheduleEvent[];
}

const props = defineProps<Props>()

</script>

