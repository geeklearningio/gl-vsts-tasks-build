import { series } from "async";
import * as fs from "fs";
import * as minimist from "minimist";
import * as path from "path";
import * as tasks from "./tasks";

// eslint-disable-next-line
const modclean = require("modclean");

type ModCleanOptions = {
    cwd?: string;
    patterns?: string[];
    additionalPatterns?: string[];
    ignorePatterns?: string[];
};

const runModclean = (project: tasks.ITask) => {
    return (done: (err?: Error) => void): void => {
        if (fs.existsSync(path.join(project.directory, "node_modules"))) {
            const modcleanOptions: ModCleanOptions = {
                cwd: project.directory,
            };

            const options = minimist(process.argv.slice(2), {});

            if (options.patterns) {
                modcleanOptions.patterns = options.patterns.split(",");
            }

            if (options.additionalpatterns) {
                modcleanOptions.additionalPatterns = options.additionalpatterns.split(",");
            }

            if (options.ignorepatterns) {
                modcleanOptions.ignorePatterns = options.ignorepatterns.split(",");
            }

            modclean(modcleanOptions, (err: Error, results: string[]) => {
                // called once cleaning is complete.
                if (err) {
                    console.error(`exec error: ${err}`);
                    done(err);
                    return;
                }

                console.log(`${results.length} files removed!`);
                done();
            });
        } else {
            console.log(`modclean skipped for ${project.name}`);
            done();
        }
    };
};

const cleanTasks = tasks.getTasks().map(runModclean);

series(cleanTasks, err => {
    if (err) {
        console.error("Failed to run  modclean");
        throw err;
    }
});
