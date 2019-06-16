import * as vscode from "vscode";
import Harpoon from "./Harpoon";

/**
 * Activate the extension
 *
 * @export
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('"harpoon" is now active!');
  let disposables = [
    vscode.debug.onDidReceiveDebugSessionCustomEvent(e => {
      processCustomEvent(e);
    })
  ];
  disposables.forEach(disposable => context.subscriptions.push(disposable));

  /**
   * Process the vscode event
   *
   * @param {vscode.DebugSessionCustomEvent} e
   * @returns {Promise<any>}
   */
  const processCustomEvent = async (e: vscode.DebugSessionCustomEvent): Promise<any> => {
    switch (e.event) {
      // DebugSession process started
      case "process":
        vscode.window.showInformationMessage("Harpoon started!");
        Harpoon.Start(e);
        break;
      // DebugSession exited
      case "exited":
        vscode.window.showInformationMessage("Harpoon stopping!");
        Harpoon.Stop(e);
        break;
      // Module loaded
      case "module":
      default:
        return;
    }
  };
}

export function deactivate() { }
