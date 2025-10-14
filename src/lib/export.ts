// Utilitários de exportação (opcionais). Se libs não estiverem instaladas, os botões podem ser ocultados ou exibiremos erro amigável.

export type ExportColumn<
  T extends Record<string, unknown> = Record<string, unknown>
> = {
  key: keyof T & string;
  header: string;
  width?: number;
  format?: (value: unknown, row: T) => unknown;
};

// Interfaces mínimas das libs que usaremos (exceljs, pdfmake)
interface ExcelJSLike {
  Workbook: new () => {
    addWorksheet: (name: string) => ExcelWorksheetLike;
    xlsx: { writeBuffer: () => Promise<ArrayBuffer> };
  };
}

interface ExcelWorksheetLike {
  addRow: (values: unknown[]) => void;
  getRow: (idx: number) => { font?: Record<string, unknown> };
  columns?: Array<{ header?: string; key?: string; width?: number }>;
}

interface PdfMakeLike {
  createPdf: (docDefinition: Record<string, unknown>) => {
    download: (filename: string) => void;
  };
  vfs?: unknown;
}

async function importOptional(name: string): Promise<unknown | null> {
  try {
    // Evita erro de types em build usando import dinâmico indireto
    const dynamicImport = new Function("m", "return import(m)") as (
      m: string
    ) => Promise<unknown>;
    return await dynamicImport(name);
  } catch {
    return null;
  }
}

export async function canExport(): Promise<{ xlsx: boolean; pdf: boolean }> {
  const [xlsxOk, pdfOk] = await Promise.all([
    importOptional("exceljs")
      .then(Boolean)
      .catch(() => false),
    (async () => {
      const a = await importOptional("pdfmake");
      const b = await importOptional("pdfmake/build/pdfmake");
      return Boolean(a || b);
    })(),
  ]);
  return { xlsx: !!xlsxOk, pdf: !!pdfOk };
}

export async function exportToXLSX<
  T extends Record<string, unknown> = Record<string, unknown>
>(filename: string, columns: ExportColumn<T>[], rows: T[]): Promise<void> {
  const excelMod = (await importOptional("exceljs")) as ExcelJSLike | null;
  if (!excelMod) throw new Error("exceljs não disponível");

  const wb = new excelMod.Workbook();
  const ws = wb.addWorksheet("Dados") as ExcelWorksheetLike;
  // Cabeçalhos
  ws.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width,
  }));
  // Linhas
  for (const r of rows) {
    const values = columns.map((c) =>
      c.format
        ? c.format((r as Record<string, unknown>)[c.key], r)
        : (r as Record<string, unknown>)[c.key]
    );
    ws.addRow(values);
  }
  // Estilo simples no header (opcional)
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true } as Record<string, unknown>;

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportToPDF<
  T extends Record<string, unknown> = Record<string, unknown>
>(filename: string, columns: ExportColumn<T>[], rows: T[]): Promise<void> {
  let pdfmake = (await importOptional(
    "pdfmake/build/pdfmake"
  )) as PdfMakeLike | null;
  if (!pdfmake) {
    pdfmake = (await importOptional("pdfmake")) as PdfMakeLike | null;
  }
  if (!pdfmake) throw new Error("pdfmake não disponível");

  // Tenta carregar vfs_fonts quando disponível
  const vfsMod = (await importOptional("pdfmake/build/vfs_fonts")) as {
    vfs?: unknown;
    default?: { vfs?: unknown };
  } | null;
  const vfs = vfsMod?.vfs ?? vfsMod?.default?.vfs;
  if (vfs && "vfs" in pdfmake) {
    // atribuição em runtime suportada por pdfmake
    (pdfmake as unknown as { vfs: unknown }).vfs = vfs;
  }

  const headers = columns.map((c) => ({
    text: c.header,
    style: "tableHeader",
  }));
  const body = rows.map((r) =>
    columns.map((c) =>
      c.format
        ? c.format((r as Record<string, unknown>)[c.key], r)
        : (r as Record<string, unknown>)[c.key]
    )
  );

  const docDefinition = {
    pageOrientation: "landscape",
    content: [
      {
        table: {
          headerRows: 1,
          widths: columns.map((c) => (c.width ? c.width : "auto")),
          body: [headers, ...body],
        },
        layout: "lightHorizontalLines",
      },
    ],
    styles: {
      tableHeader: { bold: true, color: "#ffffff", fillColor: "#0c9abe" },
    },
  } as Record<string, unknown>;

  pdfmake.createPdf(docDefinition).download(`${filename}.pdf`);
}
