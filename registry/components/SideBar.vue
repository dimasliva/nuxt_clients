<template>
  <div>
    <v-app-bar color="primary" prominent elevation="0">
      <v-app-bar-nav-icon variant="text" @click="rail = !rail"></v-app-bar-nav-icon>

      <v-toolbar-title @click="navigateTo('/dashboard')" style="cursor: pointer;">
        <v-img src="logo_9PqMg0J9.png" :height="50" :width="200"></v-img>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-menu>
        <template v-slot:activator="{ props }">
          <p>Максим</p> <v-btn variant="text" v-bind="props" icon="mdi-account-circle"></v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>Сиамсов М.М.</v-list-item-title>
          </v-list-item>
          <v-list-item @click="navigateTo('/settings')">
            <v-list-item-title>Настройки<v-icon end icon="mdi-cog" size="x-small" /></v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="navigateTo('/signout')">
            <v-list-item-title>Выйти<v-icon end icon="mdi-close" size="x-small" /></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" :rail="rail" permanent class="bg-tertiary" :width="350">
      <v-list class="main_menu" :opened="opened" open-strategy="multiple" :selected="selected" select-strategy="classic"
        @update:selected=debugger>
        <v-list-item prepend-icon="mdi-magnify" value="search" @click="rail = false, pInput.focus()">
          <v-text-field single-line clearable hide-details ref="pInput" density="compact" v-model="input"
            @click:clear="input = ''"></v-text-field>
        </v-list-item>
        <template v-for="item in filteredChaptersGr()">
          <v-list-group v-if="item.childs?.length! > 0" @click="rail = false" :value="item.id">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.title" :value="item.title"></v-list-item>
            </template>
            <template v-if="rail == false">
              <v-list-item v-for="el in item.childs" @click="navigateTo(el.getPagePath())"
                style="padding-inline-start: 50px !important;">
                <v-icon :icon="el.icon" size="x-small" start>
                </v-icon>
                <v-list-item-title class="text-body-2 d-inline">
                  {{ el.title }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-list-group>
          <v-list-item v-else :prepend-icon="item.icon" :title="item.title" :value="item.title"
            @click="navigateTo(item.getPagePath())"></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-row align="center" justify="start" class="ma-0 bg-tertiary" style="height: 40px !important;">
      <v-col v-for="(selection, i) in pages" :key="selection.title" cols="auto" class="py-1 pe-0">
        <v-chip closable class="bg-secondary ma-0" @click="navigateTo(selection.link)"
          @click:close="pages.splice(i, 1), pages.find(e => e.title == currPageTitle) ? currPin = false : currPin = true">
          {{ selection.title }}
        </v-chip>
      </v-col>
    </v-row>
    <v-card class="overflow-y-auto " elevation="0" height="87vh">
      <v-row class="ma-0 pt-3 px-4 bg-background" style="position: sticky !important; top:0">
        <p class="text-h6 font-weight-bold mx-2">{{ currPageTitle }}</p>
        <v-btn v-if="currPin" variant="text" icon size="small" @click="onPinPageBtnClick">
          <v-icon>mdi-pin</v-icon>
          <v-tooltip activator="parent" location="top">Закрепить</v-tooltip>
        </v-btn>
        <v-btn v-else variant="text" size="small"
          @click="pages.splice(pages.findIndex(e => e.title == currPageTitle), 1), pages.find(e => e.title == currPageTitle) ? currPin = false : currPin = true"
          icon>
          <v-icon>mdi-pin-off</v-icon>
          <v-tooltip activator="parent" location="top">Открепить</v-tooltip>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn v-for="buttons in currPageButtons" elevation="0" class="mx-2" rounded="xl" :append-icon="buttons.icon"
          variant="outlined" :color="buttons.color" :background-color="buttons.bkgColor" :disabled="buttons.disabled"
          @click="buttons.action()">
          {{ buttons.title }}
        </v-btn>
        <v-menu :open-on-hover="true">
          <template v-slot:activator="{ props }">
            <v-btn v-if="currPageMenu?.icon" v-bind="props" variant="outlined" color="secondary" size="small" class="mx-4"
              :icon="currPageMenu?.icon" />
          </template>
          <v-list>
            <v-list-item v-for="child in currPageMenu.childs" :key="child.id" :disabled="child.disabled"
              @click="child.action">
              <v-list-item-title>{{ child.title }}<v-icon end :icon="child.icon" size="x-small" /></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-row>
      <NuxtPage :keepalive="true" @vnode-updated="debugger" class="px-4" />
      <!-- <FormsDialogForm v-model="modal" :tab="checkFields" v-on:modal-off="modal = false"/> -->

    </v-card>

    <v-dialog v-model="dialog" persistent width="auto">
      <component :is="dialogForm" v-bind="dialogFormProps" />
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { IModuleItemsMenu } from '~~/lib/ModuleManager';
import { ModuleManager } from '~~/lib/ModuleManager';
import { CloneData } from "@/lib/Helpers";
import { EnumArray } from "@/lib/EnumArray";
import { PageMap } from '~~/lib/PageMap';
import MenuTab from '~~/components/MenuTab.vue';




let pInput = ref();
let input = ref('')
let drawer = ref(true)
let rail = ref(true)
const iocc = useContainer();
let opened = ref();
let selected = ref();
let currPageTitle = ref('')
let currPageButtons = ref()
let currPageMenu = ref()
let currPin = ref(true)
let modal = ref(false)
let btnName = ref('')
let btnId = ref('')
let checkFields = ref([])

let dialogForm = shallowRef<any>(null);
let dialogFormProps = ref(null)
let dialog = ref(false);

let pages = ref<any[]>([])

const modManager = iocc.get<ModuleManager>("ModuleManager");
const pageMap = iocc.get<PageMap>("PageMap");

const chapters = modManager.getModuleItemsMenu();

const route = useRoute()

watch(() => route.query, () => {
  const pageData = pageMap.getPageData(route.path)
  currPageTitle.value = pageData?.title || "";
  currPageButtons.value = pageData?.mainBtnBar || "";
  currPageMenu.value = pageData?.mainMenu || "";
  pages.value.find(e => e.title == currPageTitle.value) ? currPin.value = false : currPin.value = true;
  checkFields.value = [];
})

const dialogComp = getDialogComponent();

watch(() => dialogComp.value, () => {
  if (dialogComp.value != null) {
    dialogForm.value = dialogComp.value.Component;
    dialogFormProps.value = dialogComp.value.Props;
    dialog.value = true;
  }
  else{
    dialog.value = false;
  }
})

const onPinPageBtnClick = (e) => {
  const pageData = pageMap.getPageData(route.path)
  if (!pageData) return;
  if (pages.value.find((v, i, o) => v.link == route.path)) return;
  pages.value.push({ icon: pageData.icon, title: pageData.title, link: route.path })
  pages.value.find(e => e.title == currPageTitle.value) ? currPin.value = false : currPin.value = true;
}

let translit = (word) => {
  const converter = {
    'a': 'ф', 'b': 'и', 'v': 'м', 'g': 'п', 'd': 'в',
    'e': 'у', 'z': 'я', 'i': 'ш', 'y': 'н', 'k': 'л',
    'l': 'д', 'm': 'ь', 'n': 'т', 'o': 'щ', 'p': 'з',
    'r': 'к', 's': 'ы', 't': 'е', 'u': 'г', 'f': 'а',
    'h': 'р', 'c': 'с', 'j': 'о', 'w': 'ц', ';': 'ж',
    "'": 'э', ',': 'б', "x": "ч"
  };

  for (const [key, value] of Object.entries(converter)) {
    word = word.replaceAll(key, value);
  }

  return word;
}

let filteredChaptersGr = () => {

  const _filter = (_chapters: IModuleItemsMenu[]) => {
    let res = new EnumArray<IModuleItemsMenu>();
    _chapters.forEach(chapter => {

      let newChapter: IModuleItemsMenu = {
        id: chapter.id,
        title: chapter.title,
        icon: chapter.icon,
        getPagePath: chapter.getPagePath
      };

      let filtred = chapter.title.toLowerCase().includes(translit(input.value.toLowerCase()));
      if (chapter.childs?.length! >= 0) {
        if (filtred)
          newChapter.childs = chapter.childs;
        else
          newChapter.childs = _filter(chapter.childs!)
      }
      if (filtred || newChapter.childs?.length! > 0) res.push(newChapter);
    });

    return res;
  };

  let res = _filter(chapters)

  if (input.value) {
    let newopened: string[] = [];
    res.forEach((val) => { if (val.childs?.length! > 0) newopened.push(val.id) })
    opened.value = newopened;
  }
  else opened.value = null;

  return res;
}

</script>

<style lang="scss">@use '~/settings';</style>