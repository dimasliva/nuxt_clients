<template>
    <v-row class="pl-2 ma-4" >
        <p class="text-h5 text-center">Cluster Management</p>
      <v-spacer></v-spacer>
        <v-btn color="primary" class="mr-2" variant="outlined">ATTACH</v-btn>
        <v-btn color="primary" class="mr-2" variant="tonal">CREATE</v-btn>
    </v-row>
    <v-row class="ml-2 mr-1 pa-0">
      <v-col>
        <v-card>
          <v-table class="rounded-t-lg" height="260px">
            <thead class="bg-primary">
              <tr>
                <th></th>
                <th class="text-left font-weight-bold">
                  Name
                  <v-icon icon="mdi-arrow-up"></v-icon>
                </th>
                <th class="text-left font-weight-bold">Status</th>
                <th class="text-right font-weight-bold">Client Nodes</th>
                <th class="text-right font-weight-bold">Server Nodes</th>
                <th class="text-left font-weight-bold">Cluster Type</th>
                <th class="text-center font-weight-bold">Version</th>
                <th class="text-center font-weight-bold">Secure</th>
                <th class="text"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in info" :key="item.name">
                <td>
                  <v-radio color="radio" value="1"></v-radio>
                </td>
                <td>{{ item.name }}</td>
                <td>
                  <v-icon
                    variant="text"
                    icon="mdi-close-circle"
                    color="red"
                  ></v-icon>
                  Disconnected
                </td>
                <td class="text-right">0</td>
                <td class="text-right">0</td>
                <td>Attached</td>
                <td class="text-center">{{ item.version }}</td>
                <td class="text-center">
                  <v-icon variant="text" icon="mdi-lock-open-outline"></v-icon>
                </td>
                <td>
                  <v-btn variant="text" icon="mdi-dots-vertical"></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </template>
  
  <script>
  export default {
    data() {
      return {
        info: [
          {
            name: "clever_kalam",
            version: "2.14.0",
          },
          {
            name: "dazzling_burnell",
            version: "8.8.20",
          },
          {
            name: "zen_benz",
            version: "9.8.0",
          },
        ],
      };
    },
  };
  </script>
  