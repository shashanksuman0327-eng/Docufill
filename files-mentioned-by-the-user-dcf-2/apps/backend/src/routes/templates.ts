import express from "express";
import multer from "multer";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { generateFilledPdf, validateValues } from "../services/pdfGenerationService.js";
import { listTemplates, loadTemplate, saveTemplate } from "../services/templateRepository.js";
import type { FormValues, TemplateDefinition } from "../types.js";

const upload = multer({ dest: path.resolve("uploads") });
export const templatesRouter = express.Router();

templatesRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await listTemplates());
  } catch (error) {
    next(error);
  }
});

templatesRouter.get("/:id", async (req, res, next) => {
  try {
    res.json(await loadTemplate(req.params.id));
  } catch (error) {
    next(error);
  }
});

templatesRouter.post("/:id/validate", async (req, res, next) => {
  try {
    const template = await loadTemplate(req.params.id);
    res.json(validateValues(template, req.body.values as FormValues));
  } catch (error) {
    next(error);
  }
});

templatesRouter.post("/:id/generate", async (req, res, next) => {
  try {
    const template = await loadTemplate(req.params.id);
    const pdf = await generateFilledPdf(template, req.body.values as FormValues);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${template.id}-filled.pdf"`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
});

templatesRouter.put("/:id/fields", async (req, res, next) => {
  try {
    const current = await loadTemplate(req.params.id);
    const updated = { ...current, fields: req.body.fields } as TemplateDefinition;
    await saveTemplate(updated);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

templatesRouter.post("/upload", upload.single("pdf"), (req, res) => {
  // This endpoint stores the uploaded PDF and returns a starter template id.
  // Admins can then refine coordinates from the browser mapping editor.
  res.status(201).json({
    id: uuid(),
    originalName: req.file?.originalname,
    storedFile: req.file?.filename,
    message: "PDF uploaded. Create or import field definitions before generation."
  });
});
