import { Box, CircularProgress, Typography } from "@mui/material";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { useEffect, useRef, useState } from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface Props {
  url: string;
}

export const PdfPreview = ({ url }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      setLoading(true);
      const container = containerRef.current;
      if (!container) return;
      container.innerHTML = "";
      const pdf = await pdfjsLib.getDocument(url).promise;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        if (cancelled) return;
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.25 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className = "mb-4 rounded border border-slate-200 bg-white shadow-sm";
        container.appendChild(canvas);
        await page.render({ canvasContext: context, viewport }).promise;
      }
      if (!cancelled) setLoading(false);
    };
    void render();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <Box className="relative">
      {loading ? (
        <div className="flex items-center gap-3 p-4">
          <CircularProgress size={20} />
          <Typography variant="body2">Rendering preview</Typography>
        </div>
      ) : null}
      <div ref={containerRef} className="pdf-preview" />
    </Box>
  );
};
