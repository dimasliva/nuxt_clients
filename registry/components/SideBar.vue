<template>
  <v-app-bar color="primary" :density="appBarSize" elevation="0">
    <v-app-bar-nav-icon @click="() => { rail = !rail }" :size="iconSize"></v-app-bar-nav-icon>
    <v-spacer></v-spacer>
    <v-menu>
      <template v-slot:activator="{ props }">
        <p>{{ currUserName }}</p> <v-btn variant="text" v-bind="props" icon="mdi-account-circle"></v-btn>
      </template>
      <v-list>
        <v-list-item>
          <v-list-item-title>{{ userInitials }}</v-list-item-title>
        </v-list-item>
        <v-list-item @click="navTo('/settings')">
          <v-list-item-title>Настройки<v-icon end icon="mdi-cog" size="x-small" /></v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="navTo('/signout')">
          <v-list-item-title>Выйти<v-icon end icon="mdi-close" size="x-small" /></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
  <!--Левая панель-->
  <v-navigation-drawer @mouseenter="() => { railPrev = rail; rail = false; }" @mouseleave="() => { rail = railPrev; }"
    v-model="drawer" :rail="rail" permanent class="bg-tertiary" floating :width="drawerWidth">
    <v-list :opened="opened" open-strategy="single" :selected="selected" select-strategy="independent">
      <v-list-item prepend-icon="mdi-magnify" :active="false" value="search" @click="rail = false, pInput.focus()">
        <v-text-field v-model="input" single-line :focused="false" clearable hide-details ref="pInput" density="compact"
          @click:clear="input = ''">
          <v-tooltip v-if="rail" activator="parent" location="right">Поиск</v-tooltip>
        </v-text-field>
      </v-list-item>
      <!--Левое меню-->
      <template v-for="item in filteredChaptersGr()">
        <v-list-group v-if="item.childs?.length! > 0" :value="item.title">
          <template v-slot:activator="{ props }">
            <v-list-item @click="() => { rail = false }" :active="false" v-bind="props" :prepend-icon="item.icon"
              :title="item.title">
              <v-tooltip v-if="rail" activator="parent" location="right">{{ item.title }}</v-tooltip>
            </v-list-item>
          </template>
          <v-list-item v-for="el in item.childs" @click="() => { rail = railPrev; navTo(el.getPagePath()); }"
            style="padding-inline-start: 50px !important;">
            <v-icon :icon="el.icon" size="x-small" start color="secondary"></v-icon>
            <v-list-item-title class="text-body-2 d-inline">
              {{ el.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list-group>
        <v-list-item v-else :prepend-icon="item.icon" :title="item.title" :value="item.title" :active="false"
          @click="() => { rail = railPrev; navTo(item.getPagePath()); }">
          <v-tooltip v-if="rail" activator="parent" location="right">{{ item.title }}</v-tooltip>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
  <!--Закрепленные страницы-->
  <v-row justify="start" class="ma-0 bg-tertiary" style="height: 40px !important;">
    <v-col v-for="(selection, i) in pages" :key="selection.title" cols="auto" class="py-1 pe-0">
      <v-chip closable class="bg-secondary ma-0" @click="navTo(selection.link)"
        @click:close="pages.splice(i, 1), pages.find(e => e.title == currPageTitle) ? currPin = false : currPin = true">
        {{ selection.title }}
      </v-chip>
    </v-col>
  </v-row>
  <!--Страница-->
  <v-sheet class="bg-background pr-sm-12 pr-md-12 pr-lg-0">
    <v-row class="ma-0 pt-3 px-4 bg-background">
      <!--Название страницы-->
      <p class="text-h6 text-secondary font-weight-bold mx-2">{{ currPageTitle }}</p>
      <v-btn v-if="currPin" variant="text" icon size="small" @click="onPinPageBtnClick">
        <v-icon color="secondary">mdi-pin</v-icon>
        <v-tooltip activator="parent" location="top">Закрепить</v-tooltip>
      </v-btn>
      <v-btn v-else variant="text" size="small"
        @click="pages.splice(pages.findIndex(e => e.title == currPageTitle), 1), pages.find(e => e.title == currPageTitle) ? currPin = false : currPin = true"
        icon>
        <v-icon color="secondary">mdi-pin-off</v-icon>
        <v-tooltip activator="parent" location="top">Открепить</v-tooltip>
      </v-btn>
      <v-spacer></v-spacer>
      <!--Пользовательские кнопки страницы-->
      <template v-for="(buttons, index) in currPageButtons" :key="buttons.id">
        <v-btn v-if="currPageButtons" :disabled="buttons.disabled" elevation="0" class="mx-2" rounded="xl"
          :id="buttons.id" :index="index" :icon="(buttons.title.length) ? false : buttons.icon"
          :prepend-icon="(buttons.title.length >= 1) ? buttons.icon : undefined" variant="text" :color="buttons.color"
          :background-color="buttons.bkgColor" :text="(buttons.title.length) ? buttons.title : undefined"
          :density="(buttons.title.length) ? `default` : `comfortable`" @click="buttons.action()" />
      </template>
      <!--Пользовательское меню страницы-->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn v-if="currPageMenu?.icon" v-bind="props" variant="outlined" color="secondary" size="small" class="mx-4"
            :icon="currPageMenu?.icon" />
        </template>
        <v-list>
          <v-list-item v-for="child in currPageMenu?.childs" :key="child.id" :disabled="child.disabled"
            @click="child.action">
            <v-list-item-title>{{ child.title }}<v-icon end :icon="child.icon" size="x-small" /></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-row>
    <!--Содержимое страницы-->
    <NuxtPage ref="pageObj" :keepalive="true" />
  </v-sheet>
  <!--Всплывающие сообщения-->
  <Toaster position="bottom-right" :expand="true" closeButton richColors />
  <!--Поддержка диалоговых окон-->
  <v-dialog v-for="(item, index) in dialogForms" :key="index" :modelValue="item.showDialog" :persistent="item.modal"
    width="auto">
    <component :ref="item.refComp" :is="item.comp" v-bind="item.props" />
  </v-dialog>
</template>

<script setup lang="ts">
import type { ModuleManager, IModuleItemsMenu } from '~~/libVis/ModuleManager';
import { EnumArray } from "@/lib/EnumArray";
import { type IFrameHeaderData, PageMap } from '~~/lib/PageMap';
import type { UserContext } from '~~/lib/UserContext';
import { useDisplay } from 'vuetify/lib/framework.mjs';
import { Toaster, toast } from 'vue-sonner'
import ToastComponent from '~/components/ToastComponent.vue'
import { EMessageType } from '~~/lib/globalTypes';
import { h, markRaw } from 'vue'
import { type RouteLocationNormalizedLoaded } from 'vue-router';
import path from 'path';



interface DialogForm {
  comp: any;
  props: any;
  modal: boolean;
  eventsHandler: ((eventName: string, eventData: any) => boolean) | null;

  refComp: any | null;
  showDialog: boolean;
}

const DIALOG_FORM_LEVELS_NUMBER = 3;

const { name } = useDisplay();
let drawerWidth = computed(() => {
  switch (name.value) {
    case 'xs': return 100
    case 'sm': return 250
    case 'md': return 250
    case 'lg': return 350
    case 'xl': return 350
    case 'xxl': return 400
  }
  return undefined
});
let appBarSize = computed(() => {
  switch (name.value) {
    case 'xs': return 'compact'
    case 'sm': return 'compact'
    case 'md': return 'comfortable'
    case 'lg': return 'default'
    case 'xl': return 'default'
    case 'xxl': return 'prominent'
  }
  return undefined
});
let iconSize = computed(() => {
  switch (name.value) {
    case 'xs': return 'small'
    case 'sm': return 'small'
    case 'md': return 'default'
    case 'lg': return 'default'
    case 'xl': return 'large'
    case 'xxl': return 'x-large'
  }
  return undefined
});

const iocc = useContainer();
let currUser = iocc.get<UserContext>('UserContext');
let pInput = ref<any>(null);
let input = ref<string>('');
let drawer = ref<boolean>(true);
let rail = ref<boolean>(true);
let railPrev = ref<boolean>(true);
let opened = ref<any>([]);
let selected = ref<any>([]);
let currPageTitle = ref<IMenu | string>('');
let currPageButtons = ref<IBtnMenu[] | null>();
let currPageMenu = ref<IMenu | null>();
let currPin = ref<boolean>(true);
let pages = ref<Page[]>([]);


let dialogFormsInx = 0;
let dialogForms = ref<DialogForm[]>(Array(DIALOG_FORM_LEVELS_NUMBER).fill(
  {
    comp: null,
    props: null,
    modal: true,
    eventsHandler: null,
    refComp: null,
    showDialog: false
  }));



let createToast = (type: EMessageType, message: string, title?: string | null) => {
  toast.custom(markRaw(h<any>(ToastComponent, { type, message, title })));
}

interface Page {
  icon?: string;
  title: string;
  link: string;
}

let compObj = ref<any>();
let compObj2 = ref<any>();
let pageObj = ref<any>();

const modManager = iocc.get<ModuleManager>('ModuleManager');
const pageMap = iocc.get<PageMap>('PageMap');
const chapters = modManager.getModuleItemsMenu();
const route = useRoute();
let frameHeaderData: IFrameHeaderData | null;


const loadPageData = () => {
  currPageButtons.value = [];
  frameHeaderData = pageMap.getFrameHeaderData(route.path);
  currPageButtons.value = frameHeaderData?.mainBtnBar;
  currPageTitle.value = frameHeaderData?.title || '';
  currPageMenu.value = frameHeaderData?.mainMenu || null;
  pages.value.find(e => e.title == currPageTitle.value) ? currPin.value = false : currPin.value = true;
  onPageActivate(route);
};

onErrorCaptured((h, t) => {
  closeDiag(null, true);
});

watch(() => route.query,  ()=>nextTick(loadPageData));

onMounted(() => {
  loadPageData();
  addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  removeEventListener('keydown', onKeydown);
})

let addDiag = (val: { component: any; props: any; modal: boolean; eventsHandler: ((eventName: string, eventData: any) => boolean) | null }) => {

  if (dialogFormsInx >= DIALOG_FORM_LEVELS_NUMBER)
    return;

  dialogForms.value[dialogFormsInx++] = markRaw({
    comp: val.component,
    props: val.props,
    modal: val.modal,
    eventsHandler: val.eventsHandler,
    showDialog: true,
    refComp: ref(),
  });
};

let closeDiag = (result: any, noEmit = false) => {

  if (dialogFormsInx <= 0)
    return;

  if (noEmit || (!dialogForms.value[dialogFormsInx - 1].eventsHandler || dialogForms.value[dialogFormsInx - 1].eventsHandler!("onBeforeClose", result)))
    dialogForms.value[--dialogFormsInx] = {
      comp: null,
      props: null,
      modal: false,
      eventsHandler: null,
      showDialog: false,
      refComp: null
    };
};


const onDialogEvents = (e: string, eData: any) => {
  if (dialogFormsInx <= 0)
    return;

  const eventsHandler = dialogForms.value[dialogFormsInx - 1].eventsHandler;

  if (eventsHandler)
    return eventsHandler(e, eData);
  return false;
}

regDialogHandler(addDiag, closeDiag, onDialogEvents);
regToastHandler(createToast);


const onPinPageBtnClick = (e: any) => {
  const frameHeaderData = pageMap.getFrameHeaderData(route.path);
  if (!frameHeaderData) return;
  if (pages.value.find((v, i, o) => v.link == route.path)) return;
  pages.value.push({ icon: frameHeaderData.icon, title: frameHeaderData.title, link: route.path });
  pages.value.find(e => e.title == currPageTitle.value) ? currPin.value = false : currPin.value = true;
};

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
    res.forEach((val) => {
      if (val.childs?.length! > 0 && val.title.toLowerCase().includes(translit(input.value.toLowerCase()))) {
        if (!opened.value || !opened.value.includes(val.title)) {
          newopened.push(val.title);
          opened.value = newopened;
        }
      }
    });
  }
  else
    opened.value = null;
  return res;
}

let userData = currUser.EmployeeData!;
let currUserName = userData.name;
let userInitials = userData.surname + ' ' + (userData.name[0].toUpperCase()) + '.' + (userData.patronymic ? userData.patronymic[0] + '.' : '');


const navTo = (path: string) => {
  if (pageObj.value && route.path != path) {
    onBeforePageDeactivate(path);
  }

  navigateTo(path);
}


const getEventsHandler = () => {
  if (dialogFormsInx > 0) {
    const eventsHandler = dialogForms.value[dialogFormsInx - 1].eventsHandler;
    return eventsHandler;
  }
  else
    if (frameHeaderData) {
      return pageObj.value.pageRef.eventsHandler || null;
    }
  return null;
}



const onKeydown = (e: KeyboardEvent) => {
  if (dialogFormsInx == 0 && pInput.value.focused) return;
  let handled = false;
  const handler = getEventsHandler();
  if (handler)
    handled = handler("onKeydown", e);
}


const onBeforePageDeactivate = (nextPath: string) => {
  let handled = false;
  const handler = getEventsHandler();
  if (handler)
    handled = handler("onBeforePageDeactivate", nextPath);
}


const onPageActivate = (route: RouteLocationNormalizedLoaded) => {
  let handled = false;
  const handler = getEventsHandler();
  if (handler)
    handled = handler("onPageActivate", route);
}


watch(rail, () => {
  if (rail && !input.value)
    opened.value = [];
});
</script>

<style lang="scss">
@use "../settings.scss";
</style>