import { Disposable } from "vscode";
import { IProcessDescriptor } from "./IProcessDescriptor";

/**
 * Hooks for handling ProcessEvents
 *
 * @export
 * @interface IProcessMonitorHooks
 * @extends {Disposable}
 */
export interface IProcessMonitorHooks extends Disposable {

    /**
     * Triggered when a process has started
     *
     * @memberof IProcessMonitorHooks
     */
    onProcessStarted: (descriptor: IProcessDescriptor) => void;

    /**
     * Triggered when a process has terminated
     *
     * @memberof IProcessMonitorHooks
     */
    onProcessTerminated: (descriptor: IProcessDescriptor) => void;

}
