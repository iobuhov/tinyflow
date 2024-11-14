import { Runnable } from "./typings.js";

/**
 * Define a task.
 * It's just a helper to define a runnable.
 * Handy when your job has only one step.
 */
export function defineTask<Inputs, MutableOutputs>(
    task: Runnable<Inputs, MutableOutputs, Promise<void> | void>,
): Runnable<Inputs, MutableOutputs> {
    return {
        name: task.name,
        run: async (inputs: Inputs, outputs: MutableOutputs) => {
            try {
                await task.run(inputs, outputs);
                return { error: null };
            } catch (error) {
                return { error };
            }
        },
    };
}
