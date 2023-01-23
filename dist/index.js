"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const casual_1 = __importDefault(require("casual"));
const path_extra_1 = __importDefault(require("path-extra"));
const names = casual_1.default.array_of_words(1000);
function funcTemplate(name) {
    return `
export function ${name}() {
return 1 + 2
}
`;
}
const tsFileContents = names.map((name) => funcTemplate(name)).join("\n");
const target = "~/dev/projects/generated";
const template = "../templates";
const templatePath = path_extra_1.default.resolve(template);
const targetPath = path_extra_1.default.resolve(target);
