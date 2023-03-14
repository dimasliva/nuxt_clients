<template>
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon
        variant="text"
        @click="rail = !rail"
      ></v-app-bar-nav-icon>
  
      <v-toolbar-title>Med Office</v-toolbar-title>
  
      <v-spacer></v-spacer>

      <v-btn v-if="!$vuetify.theme.dark" @click="this.$vuetify.theme.dark = !this.$vuetify.theme.dark"  variant="text" icon="mdi-theme-light-dark"></v-btn>
      <v-divider vertical></v-divider>
           
      <v-btn variant="text" icon="mdi-disqus"></v-btn>
      <v-divider vertical></v-divider>

      <v-btn
        ><v-badge color="info" dot floating>
          <v-icon icon="mdi-bell"></v-icon> </v-badge
      ></v-btn>
      <v-divider vertical></v-divider>

      <v-btn variant="text" icon="mdi-account-circle"></v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" :rail="rail" permanent class="bg-background">
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-share-variant"
          title="Clusters"
          value="clusters"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-bell"
          title="Alerting"
          value="alerting"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-text"
          title="Tracing"
          value="tracing"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-database"
          title="SQL"
          value="sql"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-file-check"
          title="Compute"
          value="compute"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-application-brackets"
          title="Deployment"
          value="deployment"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-clock"
          title="Snapshots"
          value="snapshots"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-server"
          title="Caches"
          value="caches"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
  </template>
  
  <script>
  export default {
    data: () => ({
      drawer: true,
      group: null,
      rail: true
    }),
  };
  </script>
  