import fs from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { FormValues, PdfFieldDefinition, TemplateDefinition } from "../types.js";
import { resolveTemplatePdfPath } from "./templateRepository.js";

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  return rgb(((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255);
};

const stringifyValue = (value: FormValues[string]) => {
  if (Array.isArray(value)) return value.join(", ");
  return value == null ? "" : String(value);
};

const isDataUrl = (value: string) => value.startsWith("data:image/");

const dataUrlToBytes = (value: string) => {
  const base64 = value.split(",")[1] ?? "";
  return Buffer.from(base64, "base64");
};

const splitText = (value: string, maxChars: number) => {
  if (value.length <= maxChars) return [value];
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
};

export const validateValues = (template: TemplateDefinition, values: FormValues) => {
  const missing = template.fields
    .filter((field) => field.required)
    .filter((field) => !stringifyValue(values[field.id]).trim())
    .map((field) => ({ id: field.id, label: field.label }));

  return { ok: missing.length === 0, missing };
};

const drawTextValue = async (
  pdfDoc: PDFDocument,
  pageIndex: number,
  field: PdfFieldDefinition,
  template: TemplateDefinition,
  value: string
) => {
  if (!value.trim()) return;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.getPage(pageIndex);
  const fontSize = field.fontSize ?? template.defaults.fontSize;
  const color = hexToRgb(field.fontColor ?? template.defaults.fontColor);
  const lineHeight = field.lineHeight ?? template.defaults.lineHeight;
  const maxChars = Math.max(8, Math.floor(field.width / (fontSize * 0.55)));
  const lines = splitText(value, maxChars).slice(0, Math.max(1, Math.floor(field.height / lineHeight) + 1));

  lines.forEach((line, index) => {
    page.drawText(line, {
      x: field.x + 2,
      y: field.y + field.height - fontSize - index * lineHeight,
      size: fontSize,
      font,
      color,
      maxWidth: field.width - 4
    });
  });
};

const drawSelection = async (
  pdfDoc: PDFDocument,
  pageIndex: number,
  field: PdfFieldDefinition,
  template: TemplateDefinition,
  value: FormValues[string]
) => {
  const selected = Array.isArray(value) ? value : stringifyValue(value).split(",").map((item) => item.trim()).filter(Boolean);
  if (!selected.length) return;
  const page = pdfDoc.getPage(pageIndex);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const color = hexToRgb(field.fontColor ?? template.defaults.fontColor);

  if (field.optionPositions) {
    selected.forEach((option) => {
      const pos = field.optionPositions?.[option];
      if (pos) page.drawText("X", { x: pos.x, y: pos.y, size: pos.size ?? 8, font, color });
    });
    return;
  }

  await drawTextValue(pdfDoc, pageIndex, field, template, selected.join(", "));
};

const drawSignature = async (
  pdfDoc: PDFDocument,
  pageIndex: number,
  field: PdfFieldDefinition,
  template: TemplateDefinition,
  value: string
) => {
  if (!value) return;
  if (!isDataUrl(value)) {
    await drawTextValue(pdfDoc, pageIndex, field, template, value);
    return;
  }

  const bytes = dataUrlToBytes(value);
  const image = value.startsWith("data:image/png") ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
  pdfDoc.getPage(pageIndex).drawImage(image, {
    x: field.x,
    y: field.y,
    width: field.width,
    height: field.height
  });
};

export const generateFilledPdf = async (template: TemplateDefinition, values: FormValues) => {
  const validation = validateValues(template, values);
  if (!validation.ok) {
    const labels = validation.missing.map((field) => field.label).join(", ");
    throw new Error(`Missing required fields: ${labels}`);
  }

  const templateBytes = await fs.readFile(resolveTemplatePdfPath(template));
  const pdfDoc = await PDFDocument.load(templateBytes);

  for (const field of template.fields) {
    const value = values[field.id];
    const pageIndex = field.page - 1;
    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue;

    if (field.type === "signature") {
      await drawSignature(pdfDoc, pageIndex, field, template, stringifyValue(value));
    } else if (field.type === "checkbox" || field.type === "radio") {
      await drawSelection(pdfDoc, pageIndex, field, template, value);
    } else {
      await drawTextValue(pdfDoc, pageIndex, field, template, stringifyValue(value));
    }
  }

  return Buffer.from(await pdfDoc.save({ useObjectStreams: false }));
};
