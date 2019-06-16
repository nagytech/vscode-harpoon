import { Disposable, DebugSessionCustomEvent, window } from "vscode";
import { ParentProcessMonitor } from "./services/ParentProcessMonitor";
import DebugSessionDescriptor from "./models/ParentDebugSessionDescriptor";
import ParentDebugSessionDescriptor from "./models/ParentDebugSessionDescriptor";
import { ChildDebugSessionManager } from "./services/ChildDebugSessionManager";


/**
 * Harpoon extension
 *
 * @export
 * @class Harpoon
 * @implements {Disposable}
 */
export default class Harpoon implements Disposable {

  /**
   * Set of active process monitors
   *
   * @private
   * @static
   * @type {Set<ParentProcessMonitor>}
   * @memberof Harpoon
   */
  private static readonly processMonitors: Set<ParentProcessMonitor>
    = new Set<ParentProcessMonitor>();

  /**
   * Start a ParentProcessMonitor for a given DebugSession
   * @static
   * @param {DebugSessionCustomEvent} e
   * @returns {void}
   * @memberof Harpoon
   */
  public static Start(e: DebugSessionCustomEvent): void {
    var debugSessionDescriptor = new ParentDebugSessionDescriptor(e);
    if (Harpoon.processIsMonitored(debugSessionDescriptor.Pid) === true) {
      console.log(
        `Harpoon: Monitored process is child of parent debug session. ` +
        ` Refusing to recursively monitor the process.`
      );
      return;
    }
    window.showInformationMessage(
      `Harpoon: Starting process monitor [${debugSessionDescriptor.Pid}]`
    );
    Harpoon.monitorProcess(debugSessionDescriptor);
  }


  /**
   * Stop monitoring a DebugSession
   *
   * @static
   * @param {DebugSessionCustomEvent} e
   * @memberof Harpoon
   */
  public static Stop(e: DebugSessionCustomEvent): void {
    var sessionId = e.session.id;
    var toRemove = [] as ParentProcessMonitor[];
    for (const monitor of this.processMonitors) {
      if (monitor.Descriptor.SessionId === sessionId) {
        window.showInformationMessage(
          `Harpoon: Stopping process monitor [${monitor.Descriptor.Pid}]`
        );
        toRemove.push(monitor);
        monitor.Stop();
      }
    }
    toRemove.forEach(monitor => this.processMonitors.delete(monitor));
  }

  private static monitorProcess(
    debugSessionDescriptor: DebugSessionDescriptor
  ): void {
    var monitor = new ParentProcessMonitor(
      debugSessionDescriptor, new ChildDebugSessionManager()
    );
    this.processMonitors.add(monitor);
    monitor.Start();
  }

  private static processIsMonitored(pid: number): boolean {
    for (const activeMonitor of Harpoon.processMonitors) {
      for (const childProcess of activeMonitor.listChildProcesses()) {
        if (childProcess === pid) {
          return true;
        }
      }
    }
    return false;
  }

  public dispose() {
    Harpoon.processMonitors.forEach(
      processMonitor => processMonitor.dispose()
    );
    Harpoon.processMonitors.clear();
  }
}
