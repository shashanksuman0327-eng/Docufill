import type { FormValues, TemplateDefinition } from "../types";

const jsonHeaders = { "Content-Type": "application/json" };

export const getTemplate = async (id = "dcf-format") => {
  const response = await fetch(`/api/templates/${id}`);
  if (!response.ok) throw new Error("Unable to load template definition");
  return (await response.json()) as TemplateDefinition;
};

export const generatePdf = async (templateId: string, values: FormValues) => {
  const response = await fetch(`/api/templates/${templateId}/generate`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ values })
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "PDF generation failed" }));
    throw new Error(payload.error ?? "PDF generation failed");
  }
  return response.blob();
};

export const uploadTemplate = async (file: File) => {
  const data = new FormData();
  data.append("pdf", file);
  const response = await fetch("/api/templates/upload", { method: "POST", body: data });
  if (!response.ok) throw new Error("Upload failed");
  return response.json();
};

export const saveFields = async (templateId: string, fields: TemplateDefinition["fields"]) => {
  const response = await fetch(`/api/templates/${templateId}/fields`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({ fields })
  });
  if (!response.ok) throw new Error("Unable to save field definitions");
  return (await response.json()) as TemplateDefinition;
};
