import { Disposable, debug, DebugSession, window } from "vscode";
import { IProcessDescriptor } from "../interfaces/IProcessDescriptor";
import { IProcessMonitorHooks } from "../interfaces";
import { DebugConfiguration } from "../models/DebugConfiguration";

/**
 *  Manages debug sessions for child processes
 *
 * @export
 * @class ChildDebugSessionManager
 * @implements {IProcessMonitorHooks}
 * @implements {Disposable}
 */
export class ChildDebugSessionManager implements IProcessMonitorHooks, Disposable {

  /**
   * Map from PID to DebugSession
   *
   * @type {Map<number, DebugSession>}
   * @memberof ChildDebugSessionManager
   */
  childDebugSessions: Map<number, DebugSession> = new Map<number, DebugSession>();

  /**
   * Creates a DebugSession for a given the process identified
   * within the IProcessDescriptor
   *
   * @memberof ChildDebugSessionManager
   */
  public onProcessStarted = (descriptor: IProcessDescriptor): void => {
    var config = new DebugConfiguration(descriptor);
    this.childDebugSessions.set(
      descriptor.PID,
      { name: config.name } as DebugSession
    );
    window.showInformationMessage(
      `Harpoon: Get Over Here! [${descriptor.PID}]`
    );
    debug.startDebugging(undefined, config);
  }

  /**
   * Disconnect the debug session allocated to the process
   * identified in the IProcessDescriptor
   *
   * @memberof ChildDebugSessionManager
   */
  public onProcessTerminated = (descriptor: IProcessDescriptor): void => {
    var debugSession = this.childDebugSessions.get(descriptor.PID);
    if (debugSession === undefined) {
      return;
    }
    window.showInformationMessage(
      `Harpoon: Disconnecting debugger from child process [${descriptor.PID}]`
    );
    debugSession.customRequest("disconnect");
  }

  /**
   * Disposes of the resources in this instance
   *
   * @memberof ChildDebugSessionManager
   */
  dispose() {
    this.childDebugSessions.forEach(debugSession => {
      debugSession.customRequest("disconnect");
    });
    this.childDebugSessions.clear();
  }

}
