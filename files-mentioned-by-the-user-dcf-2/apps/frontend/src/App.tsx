import DownloadIcon from "@mui/icons-material/Download";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Alert,
  AppBar,
  Box,
  Button,
  CssBaseline,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { DynamicForm } from "./components/DynamicForm";
import { MappingEditor } from "./components/MappingEditor";
import { PdfPreview } from "./components/PdfPreview";
import { UploadDropzone } from "./components/UploadDropzone";
import { generatePdf, getTemplate, saveFields, uploadTemplate } from "./lib/api";
import { clearSavedValues, loadSavedValues, saveValues } from "./lib/storage";
import type { FormValues, PdfFieldDefinition, TemplateDefinition } from "./types";

export const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [tab, setTab] = useState(0);
  const [template, setTemplate] = useState<TemplateDefinition | null>(null);
  const [values, setValues] = useState<FormValues>(loadSavedValues);
  const [missingIds, setMissingIds] = useState<Set<string>>(new Set());
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [message, setMessage] = useState("");

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode: darkMode ? "dark" : "light", primary: { main: "#1a73e8" }, secondary: { main: "#188038" } },
        shape: { borderRadius: 8 }
      }),
    [darkMode]
  );

  useEffect(() => {
    void getTemplate().then(setTemplate).catch((error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    saveValues(values);
  }, [values]);

  const onChange = (id: string, value: string | string[]) => {
    setValues((current) => ({ ...current, [id]: value }));
    setMissingIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  };

  const validateRequired = () => {
    if (!template) return false;
    const missing = template.fields
      .filter((field) => field.required)
      .filter((field) => {
        const value = values[field.id];
        return Array.isArray(value) ? value.length === 0 : !String(value ?? "").trim();
      })
      .map((field) => field.id);
    setMissingIds(new Set(missing));
    return missing.length === 0;
  };

  const handleGenerate = async () => {
    if (!template || !validateRequired()) {
      setMessage("Please complete required fields before generating.");
      return;
    }
    const blob = await generatePdf(template.id, values);
    if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    setGeneratedUrl(URL.createObjectURL(blob));
    setTab(1);
  };

  const handlePrint = () => {
    if (!generatedUrl) return;
    const win = window.open(generatedUrl, "_blank");
    win?.addEventListener("load", () => win.print());
  };

  const handleSaveMapping = async (fields: PdfFieldDefinition[]) => {
    if (!template) return;
    const updated = await saveFields(template.id, fields);
    setTemplate(updated);
    setMessage("Field mapping saved.");
  };

  const resetForm = () => {
    clearSavedValues();
    setValues({});
    setGeneratedUrl("");
    setMissingIds(new Set());
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={darkMode ? "min-h-screen bg-slate-950" : "min-h-screen bg-slate-50"}>
        <AppBar position="sticky" color="inherit" elevation={1}>
          <Toolbar className="gap-3">
            <PictureAsPdfIcon color="primary" />
            <Box className="min-w-0 flex-1">
              <Typography variant="h6" noWrap>
                DCF PDF Form Generator
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Fill, preview, print, and download the exact PDF template
              </Typography>
            </Box>
            <IconButton aria-label="Toggle dark mode" onClick={() => setDarkMode((current) => !current)}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <main className="mx-auto flex max-w-7xl flex-col gap-4 p-4">
          <UploadDropzone
            onUpload={async (file) => {
              const result = await uploadTemplate(file);
              setMessage(result.message);
            }}
          />

          <div className="rounded border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="scrollable">
              <Tab label="Fill form" />
              <Tab label="Live preview" />
              <Tab label="Mapping editor" />
            </Tabs>
          </div>

          {tab === 0 && template ? (
            <div className="space-y-4 rounded border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <Typography variant="h5">{template.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.fields.length} mapped fields across {template.pages.length} pages. Data is auto-saved locally.
                  </Typography>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button startIcon={<RestartAltIcon />} onClick={resetForm}>
                    Reset
                  </Button>
                  <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={() => void handleGenerate()}>
                    Generate PDF
                  </Button>
                </div>
              </div>
              <DynamicForm fields={template.fields} values={values} onChange={onChange} missingIds={missingIds} />
            </div>
          ) : null}

          {tab === 1 ? (
            <div className="space-y-4 rounded border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Typography variant="h5">Preview</Typography>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outlined" disabled={!generatedUrl} startIcon={<PrintIcon />} onClick={handlePrint}>
                    Print PDF
                  </Button>
                  <Button
                    variant="contained"
                    disabled={!generatedUrl}
                    startIcon={<DownloadIcon />}
                    href={generatedUrl}
                    download="dcf-filled.pdf"
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
              {generatedUrl ? <PdfPreview url={generatedUrl} /> : <Alert severity="info">Generate a PDF to see the live preview.</Alert>}
            </div>
          ) : null}

          {tab === 2 && template ? (
            <div className="rounded border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <MappingEditor template={template} onSave={handleSaveMapping} />
            </div>
          ) : null}
        </main>

        <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage("")}>
          <Alert severity="info" onClose={() => setMessage("")}>
            {message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};
