export type FieldType =
  | "text"
  | "number"
  | "date"
  | "dropdown"
  | "checkbox"
  | "radio"
  | "signature"
  | "qualification-row";

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
}

export interface TemplateDefinition {
  id: string;
  name: string;
  templateFile: string;
  defaults: {
    fontSize: number;
    fontColor: string;
    lineHeight: number;
    required: boolean;
  };
  pages: Array<{ page: number; width: number; height: number }>;
  fields: PdfFieldDefinition[];
}

export type FormValues = Record<string, string | string[]>;
