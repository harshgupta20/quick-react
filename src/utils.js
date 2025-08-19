import { execSync } from "node:child_process";

export const run = (cmd, cwd = process.cwd()) => {
  console.log(`\n📦 Running: ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd });
};
