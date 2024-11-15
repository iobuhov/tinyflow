# tinyflow

Zero dependency library for writing type safe, organized workflows for node. Inspired by GitHub actions.

## Installation

To install the library, use the following command:

```sh
$ npm install @iobuhovxyz/tinyflow
```

```sh
$ pnpm add @iobuhovxyz/tinyflow
```

## Usage

### Quick start

```sh
$ npm i @iobuhovxyz/tinyflow tsx typescript @types/node @tsconfig/node22
```

```sh
$ cat <<EOF > tsconfig.json
{
  "extends": "@tsconfig/node22/tsconfig.json",
  "include": ["*.ts"]
}
EOF
```

### Defining a Job

To define a job, use the `defineJob` helper function. A job consists of a series of steps that are executed in sequence. Use `defineStep` to define steps with context (e.g `defineStep<MyContext>`).

```ts
// example1.ts
import { defineJob } from "@iobuhovxyz/tinyflow/job.mjs";

const job = defineJob({
    name: "Example Job",
    steps: [
        {
            name: "Step 1",
            run: async () => {
                console.log("Running Step 1");
            },
        },
        {
            name: "Step 2",
            run: async () => {
                console.log("Running Step 2");
            },
        },
    ],
    setup: async (inputs, outputs) => {
        return { inputs, outputs };
    },
    finally: async () => {
        console.log("Job completed");
    },
});

await job.run(null, null);
```

```sh
$ npx tsx example1.ts
[1/2] Step 1
Running Step 1
[2/2] Step 2
Running Step 2
Running finally hook
Job completed
```

### Defining a workflow

To define a workflow, use the `defineWorkflow` helper function.

```ts
// example2.ts
import { defineWorkflow } from "@iobuhovxyz/tinyflow/workflow.mjs";
import { defineJob } from "@iobuhovxyz/tinyflow/job.mjs";

interface Context {
    inputs: number;
    outputs: unknown;
    data: number;
}

const job = defineJob({
    name: "Build",
    setup: (inputs: number, outputs: unknown): Context => ({
        inputs,
        outputs,
        data: Math.max(inputs, 0),
    }),
    steps: [
        {
            name: "Run build",
            run: ctx => {
                console.info("Building...", ctx);
            },
        },
    ],
});

const workflow = defineWorkflow({
    jobs: [job],
    options: {
        logger: console,
    },
});

const inputs = 42;
const outputs = {};

await workflow.run(inputs, outputs);
```

```sh
$ npx tsx example2.ts
[workflow] start workflow
[workflow] running 'Build'
[1/1] Run build
Building... { inputs: 42, outputs: {}, data: 42 }
[workflow] 'Build': done
[workflow] all jobs completed successfully
```

### License

This project is licensed under the Apache-2.0 License - see the [LICENSE](./LICENSE) file for details.
