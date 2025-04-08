


import { Container } from "inversify";
import type { SetupContext } from "vue";



export default defineComponent({
    name: "test",

    setup(props: any, ctx: SetupContext) {
        const comp = new test(props.diC, null, { settingsStorage: props.settingsStorage });
        ctx.expose({
            add: () => comp.add()  // Add a new method to the expose function
        });
        return comp.render()
    }
})


export class test {

    count = ref(2);

    constructor(diC: Container, deps?: Object | null, props?) {
    }


    add() {
        this.count.value++;
    }

    static async setup(props, ctx: SetupContext) {
        debugger;
        const comp = new test(props.diC, null, { settingsStorage: props.settingsStorage });
        ctx.expose(() => {
            add: () => comp.add()  // Add a new method to the expose function
        });
        return () => comp.render()
    }




    render() {
        return () => <div style="height: 100%;">
            {this.count.value}
        </div>
    }

}