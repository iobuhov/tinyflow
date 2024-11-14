import { vi, describe, it, expect, afterEach, beforeEach } from "vitest";
import { defineWorkflow } from "../src/workflow.mjs";
import { Runnable } from "../src/typings.js";

describe("defineWorkflow", () => {
    let job: Runnable<number, number>;

    beforeEach(() => {
        job = {
            name: "Build",
            run: vi.fn(() => Promise.resolve({ error: null })),
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return an object with run method", async () => {
        const workflow = defineWorkflow([job]);

        expect(workflow).toBeDefined();
        expect(workflow.run).toBeInstanceOf(Function);
    });

    describe("workflow.run", () => {
        it("should accept two arguments", () => {
            const workflow = defineWorkflow([job]);
            expect(workflow.run.length).toBe(2);
        });

        it("should return a Promise", async () => {
            const workflow = defineWorkflow([job]);
            expect(workflow.run(0, 0)).toBeInstanceOf(Promise);
        });

        it("should pass inputs and outputs to the job", async () => {
            const workflow = defineWorkflow([job]);

            await workflow.run(37, 42);

            expect(job.run).toHaveBeenCalledWith(37, 42);
        });
    });
});
