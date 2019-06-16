import { ProcessState } from "../enums/ProcessState";
import { IProcessDescriptor } from ".";


/**
 * Event emitted when a process state changes
 *
 * @export
 * @interface IProcessEvent
 */
export interface IProcessEvent {

    /**
     * Event state
     *
     * @type {ProcessState}
     * @memberof IProcessEvent
     */
    state: ProcessState;

    /**
     * Process descriptor
     *
     * @type {IProcessDescriptor}
     * @memberof IProcessEvent
     */
    descriptor: IProcessDescriptor;
}