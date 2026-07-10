#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const packageJsonPath = join(root, "package.json");
const cargoTomlPath = join(root, "src-tauri", "Cargo.toml");
const tauriConfPath = join(root, "src-tauri", "tauri.conf.json");

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const writeJson = (path, data) => {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

const bumpSemver = (version, type) => {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Unknown bump type: ${type}`);
  }
};

const resolveNextVersion = (currentVersion, arg) => {
  if (!arg) {
    return bumpSemver(currentVersion, "patch");
  }

  if (/^\d+\.\d+\.\d+$/.test(arg)) {
    return arg;
  }

  if (["patch", "minor", "major"].includes(arg)) {
    return bumpSemver(currentVersion, arg);
  }

  throw new Error(`Invalid version argument: ${arg}`);
};

const updateCargoTomlVersion = (content, newVersion) => {
  const lines = content.split("\n");
  let inPackageSection = false;

  return lines
    .map((line) => {
      if (line.trim() === "[package]") {
        inPackageSection = true;
        return line;
      }

      if (inPackageSection && line.startsWith("[")) {
        inPackageSection = false;
      }

      if (inPackageSection && line.startsWith("version = ")) {
        return `version = "${newVersion}"`;
      }

      return line;
    })
    .join("\n");
};

const bumpType = process.argv[2];
const packageJson = readJson(packageJsonPath);
const currentVersion = packageJson.version;
const nextVersion = resolveNextVersion(currentVersion, bumpType);

if (nextVersion === currentVersion) {
  console.log(`Version is already ${currentVersion}.`);
  process.exit(0);
}

packageJson.version = nextVersion;
writeJson(packageJsonPath, packageJson);

const cargoToml = readFileSync(cargoTomlPath, "utf8");
writeFileSync(
  cargoTomlPath,
  updateCargoTomlVersion(cargoToml, nextVersion),
  "utf8",
);

const tauriConf = readJson(tauriConfPath);
tauriConf.version = nextVersion;
writeJson(tauriConfPath, tauriConf);

const cargoCheck = spawnSync("cargo", ["check"], {
  cwd: join(root, "src-tauri"),
  stdio: "inherit",
});

if (cargoCheck.status !== 0) {
  console.error("\nVersion files were updated, but `cargo check` failed.");
  process.exit(cargoCheck.status ?? 1);
}

console.log(`\nBumped version: ${currentVersion} -> ${nextVersion}`);
console.log("Updated:");
console.log("- package.json");
console.log("- src-tauri/Cargo.toml");
console.log("- src-tauri/tauri.conf.json");
console.log("- src-tauri/Cargo.lock");
