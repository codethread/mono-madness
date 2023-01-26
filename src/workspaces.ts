import type { Deps, Key } from "./shared";

export const workspaces = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "t",
] as const;

export type Workspace = Key<typeof workspaces>;
export const workspaceDependencies: Deps<Workspace> = {
  a: ["b", "c", "e", "i"],
  b: ["c"],
  e: ["f"],
  f: ["h", "i", "j"],
  k: ["l", "m", "n", "o", "p", "t"],
};
