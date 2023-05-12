<template>
    <v-row>
      <v-col>
        <v-card class="mx-4 my-0">
          <v-table  density="compact" class="rounded-t-lg">
            <thead class="bg-primary">
              <tr>
                <th class="ma-0 pa-0"></th>
                <th class="text-tertiary text-center" v-for="item in headers" :key="item.key">{{ item.title }}</th>
                <th class="ma-0 pa-0 text-right"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in info" :key="item.name">
                <td class="pr-0" style="width: 50px;">
                <v-slide-x-transition >
                    <v-checkbox-btn v-if="checkboxShow" class="ma-0 pa-0" density="compact" hide-details="true" v-model="cheked" :value="item" color="secondary" @update:model-value="$emit('cheked', cheked)"/>
                  </v-slide-x-transition>
                </td>
                <td v-for="index in item" class="text-center pa-0">
                  {{ index }}
                </td>
                <td class="text-right ma-0">
                  <v-menu :open-on-hover="true">
                    <template v-slot:activator="{ props }">
                      <v-btn  v-bind="props" icon="mdi-dots-vertical" variant="text" :value="item" ></v-btn>
                    </template>
                    <v-list>
                      <v-list-item v-for="action in actions" @click="action.action">
                        <v-list-item-title>{{ action.title }}<v-icon end :icon="action.icon" size="x-small" /></v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </template>
  
<script setup>
let cheked = ref([])

const props = defineProps ({
  checkboxShow: Boolean,
  info: Array, 
  headers: Array,
  actions: Array
})
</script>
  