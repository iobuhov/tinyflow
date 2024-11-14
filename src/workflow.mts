import { Workflow, Logger, Runnable } from "./typings.js";

interface WorkflowOptions {
    logger?: Logger;
}

export function defineWorkflow<Inputs, Outputs>(
    jobs: Runnable<Inputs, Outputs>[],
    options: WorkflowOptions = {},
): Workflow<Inputs, Outputs> {
    const { logger = console } = options;

    const info = (message: string) => {
        logger.info(`[workflow] ${message}`);
    };

    const run = async (inputs: Inputs, outputs: Outputs) => {
        info("start workflow");

        for (const job of jobs) {
            if (job.if && !job.if(inputs, outputs)) {
                info(`skipping ${job.name}`);
                continue;
            }

            info(`running ${job.name}`);
            const { error } = await job.run(inputs, outputs);
            if (error) {
                info(`job competed with error`);
                return { error };
            }
            info(`${job.name} done`);
        }

        info("all jobs completed successfully");
        return { error: null };
    };

    return {
        run,
    };
}
