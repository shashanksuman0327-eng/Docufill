import SaveIcon from "@mui/icons-material/Save";
import { Button, MenuItem, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import type { PdfFieldDefinition, TemplateDefinition } from "../types";

interface Props {
  template: TemplateDefinition;
  onSave: (fields: PdfFieldDefinition[]) => Promise<void>;
}

export const MappingEditor = ({ template, onSave }: Props) => {
  const [fields, setFields] = useState(template.fields);
  const [selectedId, setSelectedId] = useState(template.fields[0]?.id ?? "");
  const selected = useMemo(() => fields.find((field) => field.id === selectedId), [fields, selectedId]);
  const page = template.pages.find((candidate) => candidate.page === selected?.page) ?? template.pages[0];

  const updateSelected = (patch: Partial<PdfFieldDefinition>) => {
    setFields((current) => current.map((field) => (field.id === selectedId ? { ...field, ...patch } : field)));
  };

  return (
    <div className="space-y-4">
      <Typography variant="h6">Field Mapping</Typography>
      <TextField select fullWidth size="small" label="Field" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
        {fields.map((field) => (
          <MenuItem key={field.id} value={field.id}>
            {field.page}. {field.label}
          </MenuItem>
        ))}
      </TextField>

      {selected ? (
        <div className="grid grid-cols-2 gap-3">
          {(["x", "y", "width", "height", "page"] as const).map((key) => (
            <TextField
              key={key}
              label={key.toUpperCase()}
              size="small"
              type="number"
              value={selected[key]}
              onChange={(event) => updateSelected({ [key]: Number(event.target.value) })}
            />
          ))}
        </div>
      ) : null}

      <div className="overflow-auto rounded border border-slate-200 bg-slate-50 p-3">
        <div className="relative mx-auto bg-white shadow" style={{ width: page.width, height: page.height }}>
          {fields
            .filter((field) => field.page === page.page)
            .map((field) => (
              <button
                key={field.id}
                type="button"
                title={field.label}
                className={`absolute border text-left text-[9px] ${field.id === selectedId ? "border-blue-600 bg-blue-500/20" : "border-amber-600 bg-amber-500/20"}`}
                style={{
                  left: field.x,
                  bottom: field.y,
                  width: field.width,
                  height: field.height
                }}
                onClick={() => setSelectedId(field.id)}
              >
                {field.id}
              </button>
            ))}
        </div>
      </div>

      <Button variant="contained" startIcon={<SaveIcon />} onClick={() => void onSave(fields)}>
        Save mapping JSON
      </Button>
    </div>
  );
};
