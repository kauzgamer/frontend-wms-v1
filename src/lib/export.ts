// Utilitários de exportação (opcionais). Se libs não estiverem instaladas, os botões podem ser ocultados ou exibiremos erro amigável.

export type ExportColumn<
  T extends Record<string, unknown> = Record<string, unknown>
> = {
  key: keyof T & string;
  header: string;
  width?: number;
  format?: (value: unknown, row: T) => unknown;
};

// Tipos leves para evitar dependência direta de tipos das libs
interface XLSXLike {
  utils: {
    json_to_sheet: (data: unknown[]) => unknown;
    book_new: () => unknown;
    book_append_sheet: (wb: unknown, ws: unknown, name: string) => void;
  };
  writeFile: (wb: unknown, filename: string) => void;
}

interface JsPdfModuleLike {
  jsPDF: new (opts?: unknown) => unknown;
}

type AutoTableFn = (doc: unknown, opts: Record<string, unknown>) => void;

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
    importOptional("xlsx")
      .then(Boolean)
      .catch(() => false),
    Promise.all([importOptional("jspdf"), importOptional("jspdf-autotable")])
      .then(([a, b]) => Boolean(a && b))
      .catch(() => false),
  ]);
  return { xlsx: !!xlsxOk, pdf: !!pdfOk };
}

export async function exportToXLSX<
  T extends Record<string, unknown> = Record<string, unknown>
>(filename: string, columns: ExportColumn<T>[], rows: T[]): Promise<void> {
  const xlsxMod = (await importOptional("xlsx")) as XLSXLike | null;
  if (!xlsxMod) throw new Error("xlsx não disponível");

  const data = rows.map((r) => {
    const obj: Record<string, unknown> = {};
    for (const col of columns) {
      const raw = (r as Record<string, unknown>)[col.key];
      obj[col.header] = col.format ? col.format(raw, r) : raw;
    }
    return obj;
  });
  const ws = xlsxMod.utils.json_to_sheet(data);
  const wb = xlsxMod.utils.book_new();
  xlsxMod.utils.book_append_sheet(wb, ws, "Dados");
  xlsxMod.writeFile(wb, `${filename}.xlsx`);
}

export async function exportToPDF<
  T extends Record<string, unknown> = Record<string, unknown>
>(filename: string, columns: ExportColumn<T>[], rows: T[]): Promise<void> {
  const jsPDFMod = (await importOptional("jspdf")) as JsPdfModuleLike | null;
  const autoTableMod = (await importOptional("jspdf-autotable")) as
    | { default?: AutoTableFn }
    | AutoTableFn
    | null;
  if (!jsPDFMod || !autoTableMod)
    throw new Error("jspdf/jspdf-autotable não disponível");

  const JsPDF = jsPDFMod.jsPDF;
  const doc = new JsPDF({ orientation: "landscape" });
  const head = [columns.map((c) => c.header)];
  const body = rows.map((r) =>
    columns.map((c) =>
      c.format
        ? c.format((r as Record<string, unknown>)[c.key], r)
        : (r as Record<string, unknown>)[c.key]
    )
  );

  const run: AutoTableFn =
    typeof autoTableMod === "function"
      ? (autoTableMod as AutoTableFn)
      : (autoTableMod.default as AutoTableFn);
  run(doc, {
    head,
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [12, 154, 190] },
    bodyStyles: { cellPadding: 2 },
    theme: "striped",
    tableWidth: "wrap",
  });
  // @ts-expect-error jsPDF instance tem save() em runtime
  doc.save(`${filename}.pdf`);
}
