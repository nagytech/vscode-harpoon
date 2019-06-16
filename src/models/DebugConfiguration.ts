import { IProcessDescriptor } from "../interfaces/IProcessDescriptor";

/**
 * Task configuration for attaching to an existing process
 *
 * @export
 * @class DebugConfiguration
 */
export class DebugConfiguration {

  /**
   * Process type
   *
   * @type {string}
   * @memberof DebugConfiguration
   */
  public readonly type: string = "";

  /**
   * Task type
   *
   * @type {string}
   * @memberof DebugConfiguration
   */
  public readonly request: string = "attach";

  /**
   * Task name
   *
   * @type {string}
   * @memberof DebugConfiguration
   */
  public readonly name: string = ".NET Core Attach - Harpoon";

  /**
   * Process identifier to attach
   *
   * @type {string}
   * @memberof DebugConfiguration
   */
  public readonly processId: string = "0";

  /**
   *Creates an instance of DebugConfiguration.
   * @param {IProcessDescriptor} descriptor
   * @memberof DebugConfiguration
   */
  constructor(descriptor: IProcessDescriptor) {
    this.processId = String(descriptor.PID);
    // TODO: IProcessDescriptor should to have the commandline arguments
    switch (descriptor.COMMAND) {
      case "dotnet":
        this.type = "coreclr";
        break;
      case "node":
        this.type = "node";
        break;
    }
    // TODO: Java, Python, Etc.
    this.name = `${this.name} - [${this.processId}]`;
  }

}
