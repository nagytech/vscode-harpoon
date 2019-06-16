import { IProcessDescriptor } from "../interfaces";
import { ProcessState } from "../enums/ProcessState";
import { IProcessEvent } from "../interfaces";

/**
 * Process event state and descriptor
 *
 * @abstract
 * @class ProcessEvent
 * @implements {IProcessEvent}
 */
abstract class ProcessEvent implements IProcessEvent {

  /**
   * State of the given process
   *
   * @type {ProcessState}
   * @memberof ProcessEvent
   */
  public readonly state: ProcessState;

  /**
   * Descriptor for the given process
   *
   * @type {IProcessDescriptor}
   * @memberof ProcessEvent
   */
  public readonly descriptor: IProcessDescriptor;

  /**
   *Creates an instance of ProcessEvent.
   * @param {IProcessDescriptor} descriptor
   * @param {ProcessState} state
   * @memberof ProcessEvent
   */
  protected constructor(
    descriptor: IProcessDescriptor,
    state: ProcessState
  ) {
    this.descriptor = descriptor;
    this.state = state;
  }
}

/**
 * Event raised after a process has started
 *
 * @export
 * @class ProcessStartedEvent
 * @extends {ProcessEvent}
 */
export class ProcessStartedEvent extends ProcessEvent {
  constructor(
    descriptor: IProcessDescriptor
  ) {
    super(descriptor, ProcessState.STARTED);
  }
}

/**
 * Event raised after a process has terminated
 *
 * @export
 * @class ProcessTerminatedEvent
 * @extends {ProcessEvent}
 */
export class ProcessTerminatedEvent extends ProcessEvent {
  constructor(
    descriptor: IProcessDescriptor
  ) {
    super(descriptor, ProcessState.TERMINATED);
  }
}
