# DCF PDF Form Generator

This project turns the supplied `DCF FORMAT (1).pdf` into a modern web application for filling the form online and generating a populated PDF that preserves the original scanned template.

## What was detected

- The PDF has 9 pages.
- The PDF has no AcroForm fields.
- The PDF has no annotations.
- The PDF text layer is empty, which means the template is image-only/scanned.

Because there are no native PDF form fields to extract, the app uses `shared/templates/dcf-format.fields.json` as the coordinate-based field map. The mapping can be edited from the in-app mapping editor.

## Tech stack

- Frontend: React, TypeScript, Tailwind CSS, Material UI, PDF.js
- Backend: Node.js, Express, TypeScript
- PDF generation: pdf-lib

## Project structure

```text
apps/
  backend/
    src/
      routes/templates.ts
      services/pdfGenerationService.ts
      services/templateRepository.ts
      server.ts
  frontend/
    src/
      components/
      lib/
      App.tsx
shared/
  templates/
    dcf-format.fields.json
templates/
  dcf-template.pdf
uploads/
README.md
```

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

The backend runs at:

```text
http://localhost:4000
```

## Build

```bash
npm run build
```

## API endpoints

- `GET /api/health` - health check
- `GET /api/templates` - list configured templates
- `GET /api/templates/:id` - load one template and field map
- `POST /api/templates/:id/validate` - validate required fields
- `POST /api/templates/:id/generate` - generate filled PDF
- `PUT /api/templates/:id/fields` - save field mapping JSON
- `POST /api/templates/upload` - upload a new PDF template

## Adding a new PDF template

1. Add the PDF to `templates/`.
2. Create a matching `shared/templates/<template-id>.fields.json`.
3. Use the mapping editor to adjust field positions.
4. Save the mapping and generate a test PDF.

Coordinates are stored in PDF points with the origin at the bottom-left of each page. This matches `pdf-lib`, so the same JSON drives both the form UI and the final PDF drawing.

## Notes on exact visual matching

The original template quality is preserved because the generator loads the original PDF and draws user-entered values over it. It does not rasterize, compress, or rebuild the form background.

For checkbox and radio fields, this app supports exact check-mark positioning through optional `optionPositions` entries in the JSON. Where no option-specific coordinates are present, the selected values are printed inside the mapped field area so the generated PDF remains complete and readable.
