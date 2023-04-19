<template>
    <v-row>
      <v-col>
        <v-card class="mx-4 my-0">
          <v-table  height="300px" class="rounded-t-lg">
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
  const props = defineProps ({
    info: Array, 
    headers: Array
  })


  </script>
  