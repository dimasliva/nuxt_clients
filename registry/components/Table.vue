<template>
    <v-row class="ml-2 mr-1 pa-0">
      <v-col>
        <v-card>
          <v-table class="rounded-t-lg">
            <thead class="bg-primary">
              <tr>
                <th v-for="item in headers" :key="item">{{ item }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in info" :key="item.name">
                <td v-for="index in item">
                  {{ index }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </template>
  
  <script setup>
  props = {
    info: array,
    headers: array
  }
  </script>
  