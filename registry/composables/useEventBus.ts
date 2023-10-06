import type { EventBus } from "~/lib/EventBus";


export function useGEventBus() {
    const iocc = useContainer();
    return iocc.get<EventBus>("GlobalEventBus");
}