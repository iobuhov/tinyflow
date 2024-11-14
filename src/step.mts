import { Step } from "./typings.js";

export function defineStep<T>(step: Step<T>): Step<T> {
    return step;
}
