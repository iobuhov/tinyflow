import { vi, describe, expect, it, afterEach } from "vitest";
import { defineJob } from "../src/job.mjs";

describe("defineJob", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return 'runnable'", async () => {
        const fn = vi.fn();

        const step3 = () => ({
            name: "Last",
            run: fn,
        });

        const job = defineJob({
            name: "Build",
            setup: (inputs: unknown, outputs: unknown) => ({ inputs, outputs }),
            steps: [step1(), step2(), step3()],
        });

        expect(job).toBeDefined();
        expect(job.name).toBe("Build");
        expect(job.run).toBeInstanceOf(Function);
        const run = job.run(37, 42);
        expect(run).toBeInstanceOf(Promise);
        await run;
        expect(fn).toHaveBeenCalledWith({ inputs: 37, outputs: 42 });
    });

    describe("job.run", () => {
        it("should run 'finally' hook, if present", async () => {
            const spy = vi.spyOn(console, "info");

            const job = defineJob({
                name: "Build",
                setup: (inputs: number, outputs: number) => ({ inputs, outputs }),
                steps: [step1(), step2()],
                finally: context => {
                    console.info("Finally", context);
                },
            });

            await job.run(29, 39);
            const output = spy.mock.calls.flat();

            expect(output).toMatchInlineSnapshot(`
              [
                "[1/2] Foo",
                "One",
                "[2/2] Bar",
                "Two",
                "Running finally hook",
                "Finally",
                {
                  "inputs": 29,
                  "outputs": 39,
                },
              ]
            `);
        });

        it("should skip step when step.if return false", async () => {
            const spy = vi.spyOn(console, "info");
            const fn = vi.fn(() => false);

            const job = defineJob({
                name: "Foo",
                setup: (inputs: null, outputs: null) => ({ inputs, outputs }),
                steps: [step1(), { name: "Bar", if: fn, run: () => console.info("Two") }],
            });

            await job.run(null, null);

            expect(fn).toHaveBeenCalledWith({ inputs: null, outputs: null });

            const output = spy.mock.calls.flat();

            expect(output).toMatchInlineSnapshot(`
              [
                "[1/2] Foo",
                "One",
                "[2/2] Skip Bar step",
              ]
            `);
        });
    });
});

const step1 = () => ({
    name: "Foo",
    run: () => console.info("One"),
});

const step2 = () => ({
    name: "Bar",
    run: () => console.info("Two"),
});
