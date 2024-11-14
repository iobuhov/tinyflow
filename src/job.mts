import { Runnable, JobDefinition, RollbackFn } from "./typings.js";

export function defineJob<Inputs, MutableOutputs, Context extends { inputs: Inputs; outputs: MutableOutputs }>(
    spec: JobDefinition<Inputs, MutableOutputs, Context>,
): Runnable<Inputs, MutableOutputs> {
    const { name, steps, finally: finallyHook, setup, logger = console } = spec;

    const createContext = async (
        inputs: Inputs,
        outputs: MutableOutputs,
    ): Promise<{ error: true; data: unknown } | { error: false; data: Context }> => {
        try {
            return { error: false, data: await setup(inputs, outputs) };
        } catch (error) {
            logger.error("Job setup failed");
            return { error: true, data: error };
        }
    };

    const executeSteps = async (context: Context): Promise<[error: unknown, rollbacks: RollbackFn[]]> => {
        const rollbacks: RollbackFn[] = [];
        try {
            for (const step of steps) {
                if (step.if && !step.if(context)) {
                    logger.info(formatSkipStep(step, steps.indexOf(step), steps.length));
                    continue;
                }

                logger.info(formatStep(step, steps.indexOf(step), steps.length));
                const result = await step.run(context);
                if (result?.rollback) {
                    rollbacks.push(result.rollback);
                }
            }
            return [null, rollbacks];
        } catch (error) {
            return [error, rollbacks];
        }
    };

    const rollbackSteps = async (rollbacks: RollbackFn[]) => {
        if (rollbacks.length === 0) {
            return;
        }

        logger.info("Rolling back");
        for (const rollback of rollbacks) {
            try {
                await rollback();
            } catch (error) {
                logger.error(`Failed to rollback: ${error}`);
            }
        }
    };

    const runFinallyHook = async (context: Context): Promise<unknown> => {
        if (!finallyHook) {
            return;
        }

        logger.info("Running finally hook");
        try {
            await finallyHook(context);
        } catch (error) {
            logger.error(`Finally hook failed`);
            return error;
        }
    };

    const run = async (inputs: Inputs, outputs: MutableOutputs) => {
        const ctx = await createContext(inputs, outputs);
        if (ctx.error) {
            return error(ctx.data);
        }

        const [stepError = null, rollbacks] = await executeSteps(ctx.data);

        if (stepError) {
            await rollbackSteps(rollbacks);
        }

        const finallyError = await runFinallyHook(ctx.data);

        return error(stepError ?? finallyError);
    };

    return {
        name,
        if: spec.if,
        run,
    };
}

const formatStep = (step: { name: string }, index: number, total: number): string => {
    return `${stepNumber(index, total)} ${step.name}`;
};

const formatSkipStep = (step: { name: string }, index: number, total: number): string => {
    return `${stepNumber(index, total)} Skip ${step.name} step`;
};

const stepNumber = (index: number, total: number): string => {
    return `[${index + 1}/${total}]`;
};

const error = (error: unknown) => ({ error });
