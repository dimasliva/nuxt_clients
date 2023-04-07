<template>
    <div>
      <v-card class="ma-4" elevation="4" >
      <v-tabs v-model="tab" color="primary">
        <v-tab v-for="component in components" :value="component">{{ component.header }}</v-tab>
      </v-tabs>
  
      <v-card-text>
        <v-window v-model="tab">
          <v-window-item v-for="component in components" :value="component">
            <component :is="component.val" v-bind="component.prop"/>
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

    </script>