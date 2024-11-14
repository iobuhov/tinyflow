import { Runnable } from "./typings.js";

/**
 * Define a task.
 * It's just a helper to define a runnable.
 * Handy when your job has only one step.
 */
export function defineTask<Inputs, Outputs>(runnable: Runnable<Inputs, Outputs>): Runnable<Inputs, Outputs> {
    return runnable;
}
