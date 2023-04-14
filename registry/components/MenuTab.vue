<template>
    <div>
      <v-card class="ma-4" elevation="4" >
      <v-tabs v-model="tab" color="primary">
        <template v-for="component in components" >
          <v-menu open-on-hover v-if="(component.val.forEach)" >
            <template v-slot:activator="{ props }">
              <v-btn variant="text" class="text-body-1 align-self-center " v-bind="props">
                {{ component.header }}<v-icon end>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list class="bg-grey-lighten-3">
              <v-tab class="text-body-1 ma-0 pa-0" hide-slider="true" stacked="true" :value="component" >
                <v-list-item v-for="item in component.val" class="ma-0 pa-0" @click=" compSel = component.val.indexOf(item)">
                    {{ item.hed }}
                  </v-list-item>
                </v-tab>
            </v-list>
          </v-menu>
          <v-tab v-else class="text-body-1" :value="component" >
            <div >{{ component.header }}</div>
          </v-tab>
        </template>
      </v-tabs>
  
      <v-card-text>
        <v-window v-model="tab">
          <v-window-item v-for="component in components" :value="component">
            <NuxtPage/>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
    </div>
</template>
    
<script setup>
let tab = ref(null)
const props = defineProps ({
components: Array,
})

let compSel = ref(0)

let components = [ 
  {header : "Сотрудники", val : "administration/employees"},
  {header : "Пациенты", val: [{hed:"Записаны", path: "administration/visitors", },{hed:"Прошлая неделя", path: "administration/visitors", },{hed:"Стационар", path: "administration/visitors", }]},
  {header : "Отчеты", val: "administration/reports", },
]

definePageMeta({
  keepalive: true
});
</script>