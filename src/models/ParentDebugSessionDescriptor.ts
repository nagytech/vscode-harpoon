import { DebugSessionCustomEvent } from "vscode";

/**
 * Describes a DebugSession that has been detected
 * by the vscode hooks
 *
 * @export
 * @class ParentDebugSessionDescriptor
 */
export default class ParentDebugSessionDescriptor {

    /**
     * SessionId given by VSCode
     *
     * @type {string}
     * @memberof ParentDebugSessionDescriptor
     */
    public readonly SessionId: string = "";

    /**
     * DebugSession parent PID
     *
     * @type {number}
     * @memberof ParentDebugSessionDescriptor
     */
    public readonly Pid: number = 0;
    constructor(e: DebugSessionCustomEvent) {
        if (e.session && e.session.id) {
            this.SessionId = e.session.id;
        }
        if (e.body && e.body.systemProcessId) {
            this.Pid = e.body.systemProcessId;
        }
    }
}
