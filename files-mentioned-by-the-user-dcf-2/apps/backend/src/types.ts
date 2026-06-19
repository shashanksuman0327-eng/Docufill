export type FieldType =
  | "text"
  | "number"
  | "date"
  | "dropdown"
  | "checkbox"
  | "radio"
  | "signature"
  | "qualification-row";

export interface PdfPageDefinition {
  page: number;
  width: number;
  height: number;
}

export interface PdfFieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required?: boolean;
  fontSize?: number;
  fontColor?: string;
  lineHeight?: number;
  options?: string[];
  optionPositions?: Record<string, { x: number; y: number; size?: number }>;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  templateFile: string;
  source?: Record<string, unknown>;
  defaults: {
    fontSize: number;
    fontColor: string;
    lineHeight: number;
    required: boolean;
  };
  pages: PdfPageDefinition[];
  fields: PdfFieldDefinition[];
}

export type FormValues = Record<string, string | string[] | null | undefined>;
