export interface Runnable<Inputs, MutableOutputs, RunResult = Promise<{ error: unknown }>> {
    name: string;
    if?: (inputs: Inputs, outputs: MutableOutputs) => boolean;
    run: (inputs: Inputs, outputs: MutableOutputs) => RunResult;
}

export type RollbackFn = () => Promise<void>;

export interface StepResult {
    rollback?: RollbackFn;
}

export interface Step<T> {
    name: string;
    if?: (context: T) => boolean;
    run: ((context: T) => Promise<StepResult> | Promise<void>) | ((context: T) => StepResult) | ((context: T) => void);
}

export interface Logger {
    info(message?: unknown, ...optionalParams: unknown[]): void;
    error(message?: unknown, ...optionalParams: unknown[]): void;
}

export interface JobDefinition<Inputs, MutableOutputs, Context extends { inputs: Inputs; outputs: MutableOutputs }> {
    finally?: (context: Context) => void | Promise<void>;
    if?: (inputs: Inputs, outputs: MutableOutputs) => boolean;
    name: string;
    setup: (inputs: Inputs, outputs: MutableOutputs) => Promise<Context> | Context;
    steps: Step<Context>[];
    logger?: Logger;
}

export interface Workflow<Inputs, MutableOutputs> {
    run: (inputs: Inputs, outputs: MutableOutputs) => Promise<{ error: unknown }>;
}
