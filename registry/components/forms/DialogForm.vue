<template>
  <v-toolbar color="primary">
    <v-btn icon @click="{onClose(); closeDialog()}">
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-toolbar-title>Профиль</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
    </v-toolbar-items>
  </v-toolbar>
  <template>
    <div v-for="el in empls" class="w-50 ma-2 pa-2 bg-tertiary overflow-y-auto">
       <v-text-field v-for="(param, i) in el" v-model="el[i]" :value="param" clearable :is="param"></v-text-field>
    </div>
  </template>
</template>

<script setup>

const props = defineProps({
  empls: Array,
  onClose: Function
})

</script>