import { ref } from 'vue'
import { VBtn, VCard, VCol, VForm, VTextField } from 'vuetify/lib/components/index.mjs'
import { vMaska } from "maska"

export default defineComponent({

    props: {
        filterSettings: {}
    },


    setup(props, ctx) {

        const visiblity = ref(false);
        const rId = Math.random();
        const filterSettings = props.filterSettings;
        const filterFields = filterSettings.getFields();
        const isBtnFindDisabled = ref(true);
        let lastField = ref();
        const cRefs = {};
        const updateKey = ref(0);

        let findDelay = -1;

        setInterval(() => {
            if (findDelay >= 0)
                findDelay--;

            if (findDelay == 0) {
                if (!isBtnFindDisabled.value) {
                    filterSettings.onFind(filterValues);
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

        const filterValues = reactive(new Proxy({}, proxyHandler));


        const isVisible = () => visiblity.value;
        const show = () => visiblity.value = true;
        const hide = () => visiblity.value = false;
        const toggleVis = () => { visiblity.value = !visiblity.value };


        const forcesUpdate = () => {
            updateKey.value += 1;
        };

        const autoFocus = (e) => {
            const key = e.key;
            if (!lastField.value)
                lastField.value = cRefs[filterSettings.defaultFocus].value;
            lastField.value.focus();
        }


        const checkFieldValsConstraints = () => {
            let isAllValsEmpty = true;

            for (let settingsItem in filterFields) {
                let constraints = filterFields[settingsItem].constraints;
                if (filterFields[settingsItem].type == "string") {
                    let val = filterValues[settingsItem] || "";
                    if (val) {
                        isAllValsEmpty = false;
                        if (constraints.min && val.length < constraints.min)
                            return false;
                    }
                }
            }
            return !isAllValsEmpty;
        }



        const eventsHandler = (e, d) => {

            switch (e) {
                case "onKeydown":
                    findDelay=3;
                    autoFocus(d);
                    if (d.key == 'Delete' && lastField.value) {

                        let id = lastField.value.$attrs.fldKey;
                        if (id) {
                            filterValues[id] = null;
                        }
                    }
                    return true;
            }
            return false;
        };


        ctx.expose({
            show, hide, toggleVis, isVisible, eventsHandler
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
                if (!cRefs[item])
                    cRefs[item] = ref();

                let hint = val.hint;

                if (hint == "" && val.constraints.min)
                    hint = `Мин: ${val.constraints.min}`

                let isFucused = lastField.value?.$.vnode.key == item;

                let node = <VTextField v-model={filterValues[item]} key={item} class="ma-1" variant="underlined" color="secondary" label={(isFucused ? "*" : "") + val.title}
                    clearable hint={hint} ref={cRefs[item]} onfocus={() => { lastField = cRefs[item]; forcesUpdate() }} rules={val.rules} />

                res.push(withDirectives(node, [[vMaska, null, val.constraints]]));
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
                                <VBtn color="primary" variant="text" onClick={() => { for (let item in filterValues) filterValues[item] = null }} > Сбросить</VBtn>
                            </v-row>
                        </VCol>
                    </VForm>
                </VCard>
            }

            return null;
        }

    }

});