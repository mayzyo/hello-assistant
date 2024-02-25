export class Scheduler {
    private readonly pollDelay = 1000;
    private idIncrement = 1;
    private funcMap = new Map<number, Function>();

    private static instance: Scheduler;

    private constructor() {
        this.poll(this.task, this.pollDelay);
    }

    static getInstance(): Scheduler {
        if(!Scheduler.instance) {
            Scheduler.instance = new Scheduler();
        }

        return Scheduler.instance;
    }

    add(action: () => any) {
        this.funcMap.set(++this.idIncrement, action);
        return this.idIncrement;
    }

    remove(taskId: number) {
        this.funcMap.delete(taskId);
    }

    private task = async () => {
        for (const [_, value] of this.funcMap) {
            await value();
        }
    }

    private async poll(
        fn: Function,
        delayOrDelayCallback: number | Function,
        shouldStopPolling: () => Promise<boolean> = async () => false
    ) {
        do {
            await fn()

            if (await shouldStopPolling()) {
                break;
            }

            const delay = typeof delayOrDelayCallback == 'number' ? delayOrDelayCallback : delayOrDelayCallback();
            await new Promise(resolve => setTimeout(resolve, Math.max(0, delay)));
        } while (!(await shouldStopPolling()))
    }
}