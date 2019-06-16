import { Disposable } from "vscode";
import { IProcessDescriptor, IProcessEvent, IProcessMonitorHooks } from "../interfaces";
import { ProcessStartedEvent, ProcessTerminatedEvent } from "../models/ProcessEvents";
import { ProcessState } from "../enums/ProcessState";
import { PS } from "ps-tree";
import { Subject } from "rxjs";
import DebugSessionDescriptor from "../models/ParentDebugSessionDescriptor";
import ps_tree = require("ps-tree");

/**
 * Monitor a system process and raise events when
 * child processes are spawned
 *
 * @export
 * @class ParentProcessMonitor
 * @implements {Disposable}
 */
export class ParentProcessMonitor implements Disposable {

    private readonly inspectInterval: number = 1000;

    /**
     * Set of system calls used to detect child processes
     *
     * @private
     * @type {Set<Promise<void>>}
     * @memberof ParentProcessMonitor
     */
    private readonly systemCalls: Set<Promise<void>>
        = new Set<Promise<void>>();

    /**
     * Map of child process ids to descriptors
     *
     * @private
     * @type {Map<number, IProcessDescriptor>}
     * @memberof ParentProcessMonitor
     */
    private readonly childProcesses: Map<number, IProcessDescriptor>
        = new Map<number, IProcessDescriptor>();

    /**
     * Subject of all child process events
     *
     * @private
     * @type {Subject<IProcessEvent>}
     * @memberof ParentProcessMonitor
     */
    private readonly EventStream: Subject<IProcessEvent>;

    /**
     * Event handlers to receive child process events
     *
     * @private
     * @type {IProcessMonitorHooks}
     * @memberof ParentProcessMonitor
     */
    private readonly hooks: IProcessMonitorHooks;

    /**
     * System process scan interval timer
     *
     * @private
     * @type {(NodeJS.Timeout | undefined)}
     * @memberof ParentProcessMonitor
     */
    private timer: NodeJS.Timeout | undefined;

    /**
     * Describes the parent process that is currently being monitored
     *
     * @type {DebugSessionDescriptor}
     * @memberof ParentProcessMonitor
     */
    public readonly Descriptor: DebugSessionDescriptor;

    /**
     *Creates an instance of ParentProcessMonitor.
     * @param {DebugSessionDescriptor} debugSessionDescriptor parent process id
     * @param {IProcessMonitorHooks} hooks process monitor hooks
     * @memberof ParentProcessMonitor
     */
    constructor(debugSessionDescriptor: DebugSessionDescriptor, hooks: IProcessMonitorHooks) {
        this.Descriptor = debugSessionDescriptor;
        this.hooks = hooks;
        this.EventStream = new Subject<IProcessEvent>();
    }

    /**
     * Start the process monitor
     *
     * @memberof ParentProcessMonitor
     */
    public Start(): void {
        this.limitConcurrency();
        console.info(`Starting monitor on process [${this.Descriptor.Pid}]`);
        this.EventStream.subscribe(this.handleProcessEvent);
        this.timer = setInterval(this.scanChildProcesses, this.inspectInterval);
    }

    /**
     * Stop the process monitor
     *
     * @memberof ParentProcessMonitor
     */
    public Stop(): void {
        if (this.timer) {
            console.info(`Stopping monitor on process [${this.Descriptor.Pid}]`);
            clearInterval(this.timer);
            this.timer = undefined;
        } else {
            console.error(`Monitor on process [${this.Descriptor.Pid}] already stopped`);
        }
        if (!this.EventStream.closed) {
            this.EventStream.complete();
        }
    }

    /**
     * List all known child processes
     *
     * @memberof ParentProcessMonitor
     */
    public listChildProcesses = (): IterableIterator<number> => {
        return this.childProcesses.keys();
    }

    /**
     * Scan the system for child processes related to the
     * current DebugSession parent process
     *
     * @memberof ParentProcessMonitor
     */
    scanChildProcesses = (): void => {
        var psTreeScanPromise = new Promise<readonly PS[]>((resolve, reject) => {
            if (this.systemCalls.size > 0) {
                const msg = `Child process scan already active for process [${this.Descriptor.Pid}]`;
                console.error(msg);
                return reject(msg);
            }
            return ps_tree(this.Descriptor.Pid, this.handlePsTreeScan(reject, resolve));
        });
        this.systemCalls.add(psTreeScanPromise
            .then(this.handleScannedProcesses)
            .then(this.emitProcessEvents)
            .catch(reason => {
                console.error(reason);
            })
            .finally(() => {
                this.systemCalls.clear();
            }));
    }

    /**
     * Detect if the processes are new or terminated
     *
     * @memberof ParentProcessMonitor
     */
    handleScannedProcesses = (scannedProcesses: readonly PS[]): Map<ProcessState, readonly IProcessDescriptor[]> => {
        var runningProcesses = scannedProcesses.map(process => ({
            PID: Number(process.PID),
            PPID: Number(process.PPID),
            COMMAND: (process as any).COMM
        } as IProcessDescriptor));
        var processMap: Map<ProcessState, readonly IProcessDescriptor[]> = new Map<ProcessState, readonly IProcessDescriptor[]>();
        var startedProcesses = runningProcesses
            .filter(runningProcess => {
                return !this.childProcesses.has(runningProcess.PID);
            });
        var terminatedProcesses = [] as IProcessDescriptor[];
        for (const knownpid of this.childProcesses.keys()) {
            if (!runningProcesses.some(runningProcess => runningProcess.PID === knownpid)) {
                terminatedProcesses.push(this.childProcesses.get(knownpid) as IProcessDescriptor);
            }
        }
        processMap.set(ProcessState.STARTED, startedProcesses);
        processMap.set(ProcessState.TERMINATED, terminatedProcesses);
        return processMap;
    }

    handleProcessEvent = (event: IProcessEvent): void => {
        switch (event.state) {
            case ProcessState.STARTED:
                this.childProcesses.set(event.descriptor.PID, event.descriptor);
                this.hooks.onProcessStarted(event.descriptor);
                break;
            case ProcessState.TERMINATED:
                this.childProcesses.delete(event.descriptor.PID);
                break;
        }
    }
    emitProcessEvents = (processMap: Map<ProcessState, readonly IProcessDescriptor[]>): void => {
        for (const descriptor of processMap.get(ProcessState.STARTED) as readonly IProcessDescriptor[]) {
            let event = new ProcessStartedEvent(descriptor);
            this.childProcesses.set(event.descriptor.PID, event.descriptor);
            this.hooks.onProcessStarted(event.descriptor);
        }
        for (const descriptor of processMap.get(ProcessState.TERMINATED) as readonly IProcessDescriptor[]) {
            let event = new ProcessTerminatedEvent(descriptor);
            this.childProcesses.delete(event.descriptor.PID);
            this.hooks.onProcessTerminated(event.descriptor);
        }
    }

    handlePsTreeScan(reject: (reason?: any) => void, resolve: (value?: readonly PS[] | PromiseLike<readonly PS[]> | undefined) => void): (error: Error, children: readonly PS[]) => void {
        return (e: Error, children: readonly PS[]) => {
            if (e) {
                return reject(e);
            }
            return resolve(children);
        };
    }

    limitConcurrency(): void {
        if (this.timer !== undefined) {
            const msg = `Monitor already started for process [${this.Descriptor.Pid}]`;
            console.error(msg);
            throw new Error(msg);
        }
    }

    dispose() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.EventStream.complete();
        this.hooks.dispose();
    }

}
