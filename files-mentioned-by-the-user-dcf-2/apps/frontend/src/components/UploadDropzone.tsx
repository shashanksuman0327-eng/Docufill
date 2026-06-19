import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Box, Button, Typography } from "@mui/material";
import { DragEvent, useState } from "react";

interface Props {
  onUpload: (file: File) => Promise<void>;
}

export const UploadDropzone = ({ onUpload }: Props) => {
  const [isDragging, setDragging] = useState(false);

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file?.type === "application/pdf") await onUpload(file);
  };

  return (
    <Box
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`rounded border border-dashed p-4 transition ${isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300"}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CloudUploadIcon color="primary" />
          <div>
            <Typography variant="subtitle2">Upload another PDF template</Typography>
            <Typography variant="body2" color="text.secondary">
              Drag a PDF here or browse. Add coordinates in the mapping editor before generating.
            </Typography>
          </div>
        </div>
        <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
          Browse
          <input
            hidden
            type="file"
            accept="application/pdf"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onUpload(file);
            }}
          />
        </Button>
      </div>
    </Box>
  );
};
