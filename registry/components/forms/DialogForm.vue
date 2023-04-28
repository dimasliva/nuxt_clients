<template>
        <v-card>
          <v-toolbar color="primary">
            <v-btn icon @click="{onClose(); closeDialog()}">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>Профиль</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn variant="text" >
                {{ buttonName }}
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <template>
            <v-card v-for="el in checkEmpl" class="w-50 ma-2 pa-2 bg-tertiary overflow-y-auto">
              <v-text-field v-for="(param, i) in el" v-model="el[i]" :value="param" clearable :is="param"></v-text-field>
            </v-card>
          </template>
          some text
        </v-card>
</template>

<script setup>

const props = defineProps({
  checkEmpl: Array,
  onClose: Function
})

</script>