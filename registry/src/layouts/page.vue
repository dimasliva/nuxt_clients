<template>
  <div style="height: 100dvh">
    <v-app>
      <v-main class="h-100">
        <Navbar />
        <Sidebar />
        <v-sheet
          class="w-100 bg-background pr-md-12 pr-lg-0"
          style="height: calc(100% - 40px); position: relative;" 
        >
          <PinnedPage />
          <v-row class="flex-grow-0 ma-0 pt-3 pl-4 bg-background">
            <VCol>
              <VRow>
                <FeaturePageHeaderUiPageHeader />
              </VRow>
              <VRow>
                <VCol class="w-50 h-100 pt-0 pb-0">
                  <slot />
                </VCol>
                <v-slide-y-transition>
                  <FeaturePageHeaderUiPageFilter />
                </v-slide-y-transition>
              </VRow>
            </VCol>
          </v-row>
        </v-sheet>
      </v-main>
    </v-app>
  </div>
</template>

<script lang="ts" setup></script>
