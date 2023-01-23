import { basename } from "path";

export const generateTsconfig = (include: string[]) => {
  return {
    compilerOptions: {
      target: "es5",
      module: "commonjs",
      strict: true,
      esModuleInterop: true,
      outDir: "dist",
      rootDir: "src",
      declaration: true,
    },
    include,
  };
};

export function funcTemplate(name: string): string {
  return `
export function ${name}() {
  return 1 + 2
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

function chunk<A>(array: readonly A[], size: number): A[][] {
  const chunks: A[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
