<template>
  <v-row class="mt-1 pa-0">
    <v-col>
      <v-card class="ml-6 mr-4 pa-0" height="300px">
        <v-tabs v-model="tab">
          <v-tab value="one">Baseline Topology</v-tab>
          <v-spacer></v-spacer>
          <v-btn variant="text" class="mt-2"
            ><v-badge color="info" dot floating>
              <v-icon icon="mdi-cog"></v-icon> </v-badge
          ></v-btn>
        </v-tabs>
        <v-divider></v-divider>
        <v-card-text>
          <v-window v-model="tab">
            <v-table height="300px">
              <thead class="bg-primary">
                <tr>
                  <th class="text-left font-weight-bold">Consistent ID</th>
                  <th class="text-center font-weight-bold">Node ID</th>
                  <th class="text-center font-weight-bold">Status</th>
                  <th class="text-left font-weight-bold">Node Type</th>
                  <th class="text-left font-weight-bold">Baseline</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td class="text-center">
                    <v-icon
                      color="grey"
                      size="60px"
                      icon="mdi-share-variant"
                      class="ma-2"
                    ></v-icon>
                    <p class="font-weight-black">
                      The Baseline topology is empty
                    </p>
                    <p class="font-weight-light text-disabled">
                      Nodes will appear when they join the cluster
                    </p>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </v-table>
          </v-window>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data: () => ({
    tab: null,
  }),
};
</script>
