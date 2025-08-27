import { run } from "./utils.js"

/**
 * Initializes a Git repository in the specified project directory.
 *
 * @param {string} projectPath - The file system path to the project where Git should be initialized.
 */
export const initializeGit = (projectPath) => {
    run("git init", projectPath);
}