import { ref } from 'vue'
import { VBtn, VCard, VCol, VForm, VTextField } from 'vuetify/lib/components/index.mjs'
import { vMaska } from "maska"
import * as Utils from '~~/lib/Utils';
import { EDataType } from '~/lib/globalTypes';

export default defineComponent({


    emits: ['update:modelValue'],

    props: {
        filterSettings: {},
        modelValue: {}
    },


    setup(props, ctx) {

        const iocc = useContainer();
        const visiblity = ref(false);
        const rId = Math.random();
        const filterSettings = props.filterSettings;
        const filterFields = filterSettings.getFields();
        const isBtnFindDisabled = ref(true);
        let lastField = "";
        const cRefs = {};
        const updateKey = ref(0);

        const fieldsOptions = reactive({
            errCnt: 0,
            changedCnt: 0,
            readonly: props.readonly ? true : false
        })

        let findDelay = -1;

        setInterval(() => {
            if (findDelay >= 0)
                findDelay--;

            if (findDelay == 0) {
                if (!isBtnFindDisabled.value) {
                    //filterSettings.onFind(filterValues);
                }
            }
        }, 1000);


        const proxyHandler = {
            set(obj, prop, value) {

                let rules = filterFields[prop].constraints

                if (rules) {
                    if (rules.max && value && value.length > rules.max)
                        return true;
                }
                return Reflect.set(obj, prop, value);
            }
        }

        const filterValues = reactive(new Proxy(props.modelValue.value, proxyHandler));
        const maskaValues = reactive(new Proxy({}, proxyHandler));

        const isVisible = () => visiblity.value;
        const show = () => visiblity.value = true;
        const hide = () => visiblity.value = false;
        const clear = () => { for (let item in filterValues) filterValues[item] = maskaValues[item] = null; }
        const toggleVis = () => { visiblity.value = !visiblity.value };
        const isFindable = () => !isBtnFindDisabled.value;

        const forcesUpdate = () => {
            updateKey.value += 1;
        };


        const autoFocus = (e) => {
            const key = e.key;
            if (!lastField)
                lastField = filterSettings.defaultFocus;
            if (cRefs[lastField]?.value)
                cRefs[lastField].value.focus();
        }


        const checkFieldValsConstraints = () => {
            let isAllValsEmpty = true;

            for (let settingsItem in filterFields) {
                let constraints = filterFields[settingsItem].constraints;
                let val = filterValues[settingsItem];

                if (filterFields[settingsItem].type == EDataType.string) {
                    if (val) {
                        isAllValsEmpty = false;
                        if (constraints.min && val.length < constraints.min)
                            return false;
                    }
                }

                if (val != null && constraints.check && !constraints.check(val))
                    return false;
            }
            return !isAllValsEmpty;
        }



        const eventsHandler = (e, d) => {

            switch (e) {
                case "onKeydown":
                    findDelay = 3;
                    autoFocus(d);
                    if (d.key == 'Enter') {
                        //обязательно! Иначе может перегружаться страница при нажатии Enter, если фокус был на поле ввода. 
                        //т.к. поля ввода находятся на form, а form посылает данные при нажатии на Enter
                        d.preventDefault()
                    }

                    if (d.key == 'Enter' && !isBtnFindDisabled.value) {
                        filterSettings.onFind(filterValues);
                    }
                    else
                        if (d.key == 'Delete' && lastField) {
                            let id = lastField;
                            if (id) {
                                filterValues[id] = maskaValues[id] = null;
                            }
                        }
                        else
                            if (!cRefs[lastField]?.value && d.keyCode >= 32 && d.key.length == 1) {
                                //фокус не установился. Что бы не терять нажатую клавишу значение записываем непосредственно в переменную
                                filterValues[lastField] = d.key;
                            }
                    return true;
            }
            return false;
        };


        const blur = () => {
            if (cRefs[lastField]?.value)
                cRefs[lastField].value.blur();
        }



        ctx.expose({
            show, hide, toggleVis, isVisible, eventsHandler, clear, blur, isFindable
        });



        const updateBtnsState = () => {
            if (filterSettings.onfilterInputUpdate)
                isBtnFindDisabled.value = !filterSettings.onCheckFilterVals(filterValues);
            else
                isBtnFindDisabled.value = !checkFieldValsConstraints();
        }



        const createFileds = () => {

            let res = [];
            console.debug("rId2: " + rId + " render: " + visiblity.value)
            for (let item in filterFields) {

                let val = filterFields[item];

                if (!Utils.chkRights(null, val.traits))
                    continue;

                if (!cRefs[item])
                    cRefs[item] = ref();

                let hint = val.hint;

                if (hint == "" && val.constraints.min)
                    hint = `Мин: ${val.constraints.min}`

                let isFucused = lastField == item;

                let node = null;


                switch (val.type) {
                    case EDataType.referenceMultiple:
                    case EDataType.reference:
                        node = <InputField state={fieldsOptions} class="pb-4" type={val.type} key={item} v-model={filterValues[item]}
                            label={val.title} finderDataProvider={val.finderDataProvider} />
                        res.push(node);
                        break;


                    default:
                        if (val.constraints["mask"]) {
                            node = <VTextField v-model={maskaValues[item]} key={item} variant="underlined" color="secondary" label={(isFucused ? "*" : "") + val.title}
                                clearable hint={hint} ref={cRefs[item]} onfocus={() => { lastField = item; forcesUpdate() }} rules={val.rules}
                                onMaska={(e) => { filterValues[item] = e.detail.unmasked }} />
                            res.push(withDirectives(node, [[vMaska, null, val.constraints]]));
                        }
                        else {
                            node = <VTextField v-model={filterValues[item]} key={item} class="ma-1" variant="underlined" color="secondary" label={(isFucused ? "*" : "") + val.title}
                                clearable hint={hint} ref={cRefs[item]} onfocus={() => { lastField = item; forcesUpdate() }} rules={val.rules} />
                            res.push(node);
                        }
                        break;
                }

            }

            return res;
        }


        // return the render function
        return () => {
            console.debug("rId: " + rId + " render: " + visiblity.value)
            updateBtnsState();

            if (visiblity.value) {
                return <VCard class="mx-auto mb-auto" width="300">
                    <VForm>
                        <VCol>
                            <v-row key={updateKey.value} class="text-body-1 ma-2" style="min-width: 200pt;">Поиск <v-spacer></v-spacer><v-icon onClick={() => hide()}>mdi-close</v-icon></v-row>

                            {createFileds()}

                            <v-row class="ma-1" style="min-width: 200pt;" justify="center">

                                <VBtn color="primary" variant="text" disabled={isBtnFindDisabled.value} onClick={() => filterSettings.onFind(filterValues)} >Поиск</VBtn>
                                <VBtn color="primary" variant="text" onClick={() => { clear() }} > Сбросить</VBtn>
                            </v-row>
                        </VCol>
                    </VForm>
                </VCard>
            }

            return null;
        }

    }

});