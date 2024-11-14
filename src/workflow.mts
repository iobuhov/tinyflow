import { Workflow, Logger, Runnable } from "./typings.js";

interface WorkflowOptions {
    logger?: Logger;
}

export function defineWorkflow<Inputs, MutableOutputs>(
    jobs: Runnable<Inputs, MutableOutputs>[],
    options: WorkflowOptions = {},
): Workflow<Inputs, MutableOutputs> {
    const { logger = console } = options;

    const info = (message: string) => {
        logger.info(`[workflow] ${message}`);
    };

    const run = async (inputs: Inputs, outputs: MutableOutputs) => {
        info("start workflow");

        for (const job of jobs) {
            if (job.if && !job.if(inputs, outputs)) {
                info(`skipping ${formatJob(job)}`);
                continue;
            }

            info(`running '${job.name}'`);
            const { error } = await job.run(inputs, outputs);
            if (error) {
                info(`${formatJob(job)}: job competed with error`);
                return { error };
            }
            info(`${formatJob(job)}: done`);
        }

        info("all jobs completed successfully");
        return { error: null };
    };

    return {
        run,
    };
}

const formatJob = (job: { name: string }) => `'${job.name}'`;
