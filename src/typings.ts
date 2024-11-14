export interface Runnable<Inputs, Outputs> {
    name: string;
    if?: (inputs: Inputs, outputs: Outputs) => boolean;
    run: (inputs: Inputs, outputs: Outputs) => Promise<{ error: unknown }>;
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

export interface JobDefinition<Inputs, Outputs, Context extends { inputs: Inputs; outputs: Outputs }> {
    finally?: (context: Context) => void | Promise<void>;
    if?: (inputs: Inputs, outputs: Outputs) => boolean;
    name: string;
    setup: (inputs: Inputs, outputs: Outputs) => Promise<Context> | Context;
    steps: Step<Context>[];
    logger?: Logger;
}

export interface Workflow<Inputs, Outputs> {
    run: (inputs: Inputs, outputs: Outputs) => Promise<{ error: unknown }>;
}
