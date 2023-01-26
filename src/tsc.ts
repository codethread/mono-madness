import { basename } from "path";

export const generateRootTsconfig = ({
  composite,
}: {
  composite?: boolean;
}) => {
  return {
    compilerOptions: {
      target: "es5",
      module: "commonjs",
      strict: true,
      esModuleInterop: true,
      declaration: true,
      ...(composite ? { composite: true } : {}),
    },
  };
};

export const generateProjectTsconfig = ({
  peers,
}: {
  peers: readonly string[];
}) => ({
  extends: "../tsconfig.json",
  files: [],
  includes: [],
  references: peers.map((peer) => ({ path: `./${peer}` })),
});

export const generateTsconfig = ({
  include,
  peers,
}: {
  include: string[];
  peers?: string[];
}) => {
  return {
    extends: "../../tsconfig.json",
    compilerOptions: {
      outDir: "dist",
      rootDir: "src",
    },
    include: include,
    ...(peers
      ? { references: peers.map((peer) => ({ path: `../${peer}` })) }
      : {}),
  };
};

export function funcTemplate(name: string): string {
  return `
export function ${name}(str: string) {
    const s = (
        Number(str.charAt(0).toUpperCase() + str.slice(1))
        .toString()
        .slice(0, 3) ?? "0"
    );
    const f = s.replace(/[^0-9]/g, "");
    return Number(f).toString();
}
`;
}

export const tsFileContents = (names: string[]) =>
  names.map((name) => funcTemplate(name)).join("\n");

export const indexFileContents = (names: string[], filename: string) =>
  names
    .map((name) => `export { ${name} } from "./${basename(filename, ".ts")}"`)
    .join("\n");

// split names into count chunks and write each chunk to a file where each name is a function
// all functions will be exported
// an index file will also be generated that imports all functions and exports them
export const generateTsFiles = (names: string[], count: number) => {
  let indexFile = "";
  const chunks = chunk(names, count);
  const files: [string, string][] = [];
  chunks.forEach((chunk, index) => {
    const fileName = `index${index}.ts`;
    const fileContents = tsFileContents(chunk);

    indexFile += "\n" + indexFileContents(chunk, fileName);

    files.push([fileName, fileContents]);
  });

  return files.concat([["index.ts", indexFile]]);
};

// split an array evenly across n arrays
function chunk<A>(arrary: readonly A[], n: number): A[][] {
  const chunks: A[][] = [];
  for (let i = 0; i < n; i++) {
    chunks.push([]);
  }

  for (let i = 0; i < arrary.length; i++) {
    const chunk = chunks[i % n];
    chunk!.push(arrary[i] as any);
  }

  return chunks;
}
