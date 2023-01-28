import { basename } from "path";
import type { Config } from "../../shared";

interface CodeConfig {
  size: "small" | "medium" | "large";
  internal: boolean;
  name: string;
  exported: boolean;
  returnType: boolean;
}

const code = {
  small: "return 'hello'",
  medium: `
    const s = (
        Number(str.charAt(0).toUpperCase() + str.slice(1))
        .toString()
        .slice(0, 3) ?? "0"
    );
    const f = s.replace(/[^0-9]/g, "");
    return Number(f).toString();
`,
  large: `
    const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26))
    switch (letter) {
        case "a": return "a";
        case "b": return "b";
        case "c": return "c";
        case "d": return "d";
        case "e": return "e";
        case "f": return "f";
        case "g": return "g";
        case "h": return "h";
        case "i": return "i";
        default: return "j";
    }
`,
};
export function funcTemplate({
  name,
  size,
  exported,
  internal,
  returnType,
}: CodeConfig): string {
  return `
${internal ? "/** @internal */" : ""}
${exported ? "export " : ""}function ${name}(str: string)${
    returnType ? ": string" : ""
  } {
  ${code[size]}
}
`;
}

export const tsFileContents = (configs: CodeConfig[]) =>
  configs.map((config) => funcTemplate(config)).join("\n");

export const indexFileContents = (names: string[], filename: string) =>
  `export { ${names.join(",\n")} } from "./${basename(filename, ".ts")}"`;

// split names into count chunks and write each chunk to a file where each name is a function
// all functions will be exported
// an index file will also be generated that imports all functions and exports them
export const generateTsFiles = (
  names: string[],
  config: Config
) => {
  const exportsCount = config.exportCount
  let indexFile = "";
  const chunks = chunk(names, config.fileCount);
  const chunkLength = chunks.length;
  const numOfExportsPerChunk = Math.floor(exportsCount / chunkLength) || 1;
  const files: [string, string][] = [];

  chunks.forEach((chunk, index) => {
    const fileName = `index${index}.ts`;
    const exportedChunk = chunk.slice(0, numOfExportsPerChunk);
    const nonExportedChunk = chunk.slice(numOfExportsPerChunk);
        const common: Omit<CodeConfig, 'name'>   = { 
            size: config.functionSize,
            returnType: config.returnTypes,
            exported: true,
            internal: false
        }

    const fileContents = tsFileContents([
      ...exportedChunk.map((name) => ({
                ...common,
                name,
      })),
      ...nonExportedChunk.map((name) => ({ ...common, name, 
        internal: config.useInternal,
            })),
    ]);

    indexFile += "\n" + indexFileContents(exportedChunk, fileName);

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
