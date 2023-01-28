import type { Deps, Key } from "./shared";

export const complexWorkspaces = [
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

type ComplexWorkspace = Key<typeof complexWorkspaces>;
export const complexWorkspaceDependencies: Deps<ComplexWorkspace> = {
  a: ["b", "c", "e", "i"],
  b: ["c"],
  e: ["f"],
  f: ["h", "i", "j"],
  k: ["l", "m", "n", "o", "p", "t"],
};

export const simpleWorkspace = ["a", "b"];
type SimpleWorkspace = Key<typeof simpleWorkspace>;
export const simpleWorkspaceDependencies: Deps<SimpleWorkspace> = {
  a: ["b"],
};

