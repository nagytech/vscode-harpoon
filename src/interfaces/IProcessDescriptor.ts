/**
 * Descriptor for a system process
 *
 * @export
 * @interface IProcessDescriptor
 */
export interface IProcessDescriptor {

    /**
     * Process identifier
     *
     * @type {number}
     * @memberof IProcessDescriptor
     */
    PID: number;

    /**
     * Parent process identifier
     *
     * @type {number}
     * @memberof IProcessDescriptor
     */
    PPID: number;

    /**
     * Command name of the process
     *
     * @type {string}
     * @memberof IProcessDescriptor
     */
    COMMAND: string;
}
