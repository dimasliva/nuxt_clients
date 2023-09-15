<template>
    <v-row style="height: 75vh; overflow-y: auto;">
        <vue-cal ref="vuecal" class="ma-2 rounded-lg"  :split-days="daySplits" active-view="day" :cell-click-hold="false" :drag-to-create-event="false" editable-events @cell-dblclick="$refs.vuecal.createEvent( $event,120,{ title: 'New Event', class: 'rounded-lg' })" locale="ru" :time-step="30" :time-from="6 * 60" :time-to="21 * 60" :events="events">
            <template #split-label="{ split }">
                <strong :style="`color: ${split.color}`">{{ split.label }}</strong>
            </template>
        </vue-cal>
        
    </v-row>
</template>

<script setup lang="ts">
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'

let vuecal = ref<any>()

let daySplits = ref([
    {label: "ivan k.", id: 1},
    {label: "vladimir b.", id: 2},
    {label: "vasya v.", id: 3}
])

let events = [
    {
        split: 1,
      start: '2023-09-20 12:30',
      end: '2023-09-20  13:45',
      title: 'some event',
      content: 'some event',
      class: 'rounded-lg bg-primary'
    },
    {
        split: 3,
      start: '2023-09-18 10:30',
      end: '2023-09-18  11:30',
      title: 'second event',
      content: 'second event',
      class: 'rounded-lg bg-secondary'
    },
    {
        split: 2,
      start: '2023-09-22 11:30',
      end: '2023-09-22 12:30',
      title: 'Dad\'s birthday!',
      content: '<v-icon color="secondary">mdi-pin-off</v-icon>',
      class: 'rounded-lg bg-error'
    }
  ]


</script>