<template>
    <div>
      <v-card class="ma-4" elevation="4" >
      <v-tabs v-model="tab" color="primary">
        <v-tab v-for="component in components" class="text-body-1" :value="component">
          <v-menu v-if="component.val.length">
            <template v-slot:activator="{ props }">
              <v-btn variant="plain" class="text-body-1" rounded="0" height="100%" v-bind="props">
                {{ component.header }}
                <v-icon end>
                  mdi-menu-down
                </v-icon>
              </v-btn>
            </template>
            <v-list class="bg-grey-lighten-3">
              <v-list-item v-for="item in component.val">
                {{ item }}
              </v-list-item>
            </v-list>
          </v-menu>
          <div v-else>{{ component.header }}</div>
        </v-tab>
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