import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography
} from "@mui/material";
import type { FormValues, PdfFieldDefinition } from "../types";
import { SignaturePad } from "./SignaturePad";

interface Props {
  fields: PdfFieldDefinition[];
  values: FormValues;
  onChange: (id: string, value: string | string[]) => void;
  missingIds: Set<string>;
}

const fieldToInputType = (type: PdfFieldDefinition["type"]) => {
  if (type === "number") return "number";
  if (type === "date") return "date";
  return "text";
};

export const DynamicForm = ({ fields, values, onChange, missingIds }: Props) => {
  const fieldsByPage = fields.reduce<Record<number, PdfFieldDefinition[]>>((acc, field) => {
    acc[field.page] = [...(acc[field.page] ?? []), field];
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(fieldsByPage).map(([page, pageFields]) => (
        <section key={page} className="space-y-4">
          <Typography variant="h6">Page {page}</Typography>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pageFields.map((field) => {
              const error = missingIds.has(field.id);
              const value = values[field.id] ?? "";

              if (field.type === "dropdown") {
                return (
                  <FormControl key={field.id} fullWidth size="small" error={error}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      label={field.label}
                      value={String(value)}
                      onChange={(event) => onChange(field.id, event.target.value)}
                    >
                      {(field.options ?? []).map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              }

              if (field.type === "radio") {
                return (
                  <FormControl key={field.id} error={error}>
                    <FormLabel>{field.label}</FormLabel>
                    <RadioGroup
                      row
                      value={String(value)}
                      onChange={(event) => onChange(field.id, event.target.value)}
                    >
                      {(field.options ?? []).map((option) => (
                        <FormControlLabel key={option} value={option} control={<Radio size="small" />} label={option} />
                      ))}
                    </RadioGroup>
                  </FormControl>
                );
              }

              if (field.type === "checkbox") {
                const selected = Array.isArray(value) ? value : [];
                return (
                  <FormControl key={field.id} error={error}>
                    <FormLabel>{field.label}</FormLabel>
                    <FormGroup row>
                      {(field.options ?? []).map((option) => (
                        <FormControlLabel
                          key={option}
                          control={
                            <Checkbox
                              size="small"
                              checked={selected.includes(option)}
                              onChange={(_, checked) => {
                                onChange(
                                  field.id,
                                  checked ? [...selected, option] : selected.filter((item) => item !== option)
                                );
                              }}
                            />
                          }
                          label={option}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                );
              }

              if (field.type === "signature") {
                return (
                  <div key={field.id} className="md:col-span-2">
                    <Typography variant="subtitle2" gutterBottom>
                      {field.label}
                    </Typography>
                    <SignaturePad value={String(value)} onChange={(next) => onChange(field.id, next)} />
                  </div>
                );
              }

              return (
                <TextField
                  key={field.id}
                  fullWidth
                  size="small"
                  label={field.label}
                  type={fieldToInputType(field.type)}
                  value={String(value)}
                  error={error}
                  helperText={error ? "Required" : " "}
                  multiline={field.type === "qualification-row"}
                  minRows={field.type === "qualification-row" ? 2 : undefined}
                  InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
                  onChange={(event) => onChange(field.id, event.target.value)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
