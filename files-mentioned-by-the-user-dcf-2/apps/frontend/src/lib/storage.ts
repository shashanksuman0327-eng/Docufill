import type { FormValues } from "../types";

const key = "dcf-form-values";

export const loadSavedValues = (): FormValues => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "{}") as FormValues;
  } catch {
    return {};
  }
};

export const saveValues = (values: FormValues) => {
  localStorage.setItem(key, JSON.stringify(values));
};

export const clearSavedValues = () => localStorage.removeItem(key);
