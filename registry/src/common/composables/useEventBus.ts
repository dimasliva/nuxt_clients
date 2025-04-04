import type { EventBus } from "~/src/common/lib/EventBus";


export function useGEventBus() {
    const iocc = useContainer();
    return iocc.get<EventBus>("GlobalEventBus");
}