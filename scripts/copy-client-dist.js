const fs = require("fs");
const path = require("path");

const sourceDir = path.resolve(__dirname, "../client/dist");
const targetDir = path.resolve(__dirname, "../dist");

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Client build output not found at ${sourceDir}`);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });
console.log(`Copied ${sourceDir} -> ${targetDir}`);
