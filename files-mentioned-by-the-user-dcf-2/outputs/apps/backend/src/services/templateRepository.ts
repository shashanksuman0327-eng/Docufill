import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TemplateDefinition } from "../types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../../..");
const sharedTemplatesDir = path.join(rootDir, "shared/templates");
const templatePdfDir = path.join(rootDir, "templates");

export const resolveTemplatePdfPath = (template: TemplateDefinition) =>
  path.join(templatePdfDir, template.templateFile);

export const listTemplates = async (): Promise<TemplateDefinition[]> => {
  const files = await fs.readdir(sharedTemplatesDir);
  const jsonFiles = files.filter((file) => file.endsWith(".fields.json"));
  return Promise.all(jsonFiles.map((file) => loadTemplate(file.replace(".fields.json", ""))));
};

export const loadTemplate = async (id: string): Promise<TemplateDefinition> => {
  const filePath = path.join(sharedTemplatesDir, `${id}.fields.json`);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as TemplateDefinition;
};

export const saveTemplate = async (template: TemplateDefinition) => {
  const filePath = path.join(sharedTemplatesDir, `${template.id}.fields.json`);
  await fs.writeFile(filePath, `${JSON.stringify(template, null, 2)}\n`, "utf8");
};
