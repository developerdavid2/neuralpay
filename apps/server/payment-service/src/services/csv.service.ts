import { db, bankAccounts, csvImports, transactions } from "@neuralpay/db";
import type {
  CsvColumnMapping,
  ServiceResult,
  CsvImportPreview,
  CsvPreviewRow,
  CsvImportResult,
} from "@neuralpay/types";
import { format, isValid, parse } from "date-fns";
import { and, eq } from "drizzle-orm";

function parseAmount(
  raw: string,
  format: "standard" | "parentheses",
): number | null {
  let cleaned = raw.trim().replace(/[$,£€₦]/g, "");
  if (format === "parentheses") {
    cleaned = cleaned.replace(/^\((.+)\)$/, "-$1");
  }
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function parseDate(raw: string, fmt: string): Date | null {
  const formatMap: Record<string, string> = {
    "MM/DD/YYYY": "MM/dd/yyyy",
    "DD/MM/YYYY": "dd/MM/yyyy",
    "YYYY-MM-DD": "yyyy-MM-dd",
  };
  const dateFnsFormat = formatMap[fmt] ?? "yyyy-MM-dd";
  const parsed = parse(raw.trim(), dateFnsFormat, new Date());
  return isValid(parsed) ? parsed : null;
}

export const CSVService = {
  // ── CSV PREVIEW ────────────────────────────────────────────────────────────
  // Parses CSV rows against the column mapping and returns a preview
  // No DB writes — pure parsing
  async previewCsv(
    filename: string,
    rows: string[][],
    mapping: CsvColumnMapping,
  ): Promise<ServiceResult<CsvImportPreview>> {
    try {
      const dataRows = mapping.hasHeader ? rows.slice(1) : rows;
      const headers = mapping.hasHeader ? (rows[0] ?? []) : [];

      const previewRows: CsvPreviewRow[] = dataRows
        .slice(0, 10)
        .map((row, idx) => {
          const errors: string[] = [];

          const rawDate = row[mapping.date] ?? "";
          const rawAmount = row[mapping.amount] ?? "";
          const rawDesc = row[mapping.description] ?? "";
          const rawMerch =
            mapping.merchant !== undefined
              ? (row[mapping.merchant] ?? "")
              : null;
          const rawType =
            mapping.type !== undefined ? (row[mapping.type] ?? "") : null;

          const date = parseDate(rawDate, mapping.dateFormat);
          const amount = parseAmount(rawAmount, mapping.amountFormat);

          if (!date) errors.push(`Cannot parse date: "${rawDate}"`);
          if (!amount) errors.push(`Cannot parse amount: "${rawAmount}"`);
          if (!rawDesc.trim()) errors.push("Description is empty");

          let type: "debit" | "credit" | null = null;
          if (rawType) {
            const lower = rawType.toLowerCase();
            if (lower.includes("credit") || lower.includes("cr"))
              type = "credit";
            else if (lower.includes("debit") || lower.includes("dr"))
              type = "debit";
          } else if (mapping.inferTypeFromSign && amount !== null) {
            type = amount < 0 ? "debit" : "credit";
          }

          return {
            rowIndex: mapping.hasHeader ? idx + 1 : idx,
            raw: row,
            parsed: {
              date: date ? format(date, "yyyy-MM-dd") : null,
              description: rawDesc.trim() || null,
              merchant: rawMerch?.trim() || null,
              amount: amount !== null ? Math.abs(amount) : null,
              type,
            },
            isValid: errors.length === 0 && type !== null,
            errors,
          };
        });

      const allDataRows = dataRows.length;
      const validCount = previewRows.filter((r) => r.isValid).length;

      return {
        success: true,
        data: {
          filename,
          totalRows: allDataRows,
          validRows: validCount,
          invalidRows: allDataRows - validCount,
          preview: previewRows,
          headers,
        },
      };
    } catch (err) {
      console.error("[TransactionsService.previewCsv]", err);
      return {
        success: false,
        error: "Failed to preview CSV",
        code: "PARSE_ERROR",
      };
    }
  },

  // ── CSV IMPORT ─────────────────────────────────────────────────────────────
  async importCsv(
    userId: string,
    bankAccountId: string,
    filename: string,
    rows: string[][],
    mapping: CsvColumnMapping,
  ): Promise<ServiceResult<CsvImportResult>> {
    try {
      // Verify account ownership
      const [account] = await db
        .select({ id: bankAccounts.id })
        .from(bankAccounts)
        .where(
          and(
            eq(bankAccounts.id, bankAccountId),
            eq(bankAccounts.userId, userId),
          ),
        )
        .limit(1);

      if (!account)
        return {
          success: false,
          error: "Bank account not found",
          code: "NOT_FOUND",
        };

      // Create import record
      const dataRows = mapping.hasHeader ? rows.slice(1) : rows;

      const [importRecord] = await db
        .insert(csvImports)
        .values({
          userId,
          bankAccountId,
          filename,
          totalRows: dataRows.length,
          importedRows: 0,
          skippedRows: 0,
          status: "processing",
          columnMapping: JSON.stringify(mapping),
        })
        .returning();

      const toInsert: (typeof transactions.$inferInsert)[] = [];
      const errors: Array<{ row: number; reason: string }> = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i]!;
        const rowNum = mapping.hasHeader ? i + 2 : i + 1;

        const rawDate = row[mapping.date] ?? "";
        const rawAmount = row[mapping.amount] ?? "";
        const rawDesc = row[mapping.description] ?? "";
        const rawType =
          mapping.type !== undefined ? (row[mapping.type] ?? "") : null;

        const date = parseDate(rawDate, mapping.dateFormat);
        const amount = parseAmount(rawAmount, mapping.amountFormat);

        if (!date) {
          errors.push({ row: rowNum, reason: `Invalid date: "${rawDate}"` });
          continue;
        }
        if (!amount) {
          errors.push({
            row: rowNum,
            reason: `Invalid amount: "${rawAmount}"`,
          });
          continue;
        }

        let type: "debit" | "credit";
        if (rawType) {
          const lower = rawType.toLowerCase();
          if (lower.includes("credit") || lower.includes("cr")) type = "credit";
          else if (lower.includes("debit") || lower.includes("dr"))
            type = "debit";
          else {
            errors.push({ row: rowNum, reason: `Unknown type: "${rawType}"` });
            continue;
          }
        } else if (mapping.inferTypeFromSign) {
          type = amount < 0 ? "debit" : "credit";
        } else {
          errors.push({
            row: rowNum,
            reason: "Cannot determine transaction type",
          });
          continue;
        }

        const merchant =
          mapping.merchant !== undefined
            ? (row[mapping.merchant] ?? "").trim() || null
            : null;

        toInsert.push({
          userId,
          bankAccountId,
          description: rawDesc.trim() || "Imported transaction",
          amount: Math.abs(amount).toString(),
          type,
          date,
          merchant,
          isManual: false,
          isAnomaly: false,
          csvImportId: importRecord!.id,
        });
      }

      // Batch insert in chunks of 500
      let imported = 0;
      const CHUNK = 500;
      for (let i = 0; i < toInsert.length; i += CHUNK) {
        const chunk = toInsert.slice(i, i + CHUNK);
        await db.insert(transactions).values(chunk);
        imported += chunk.length;
      }

      // Update import record
      await db
        .update(csvImports)
        .set({
          status: "completed",
          importedRows: imported,
          skippedRows: errors.length,
          completedAt: new Date(),
        })
        .where(eq(csvImports.id, importRecord!.id));

      return {
        success: true,
        data: {
          importId: importRecord!.id,
          imported,
          skipped: errors.length,
          errors,
        },
      };
    } catch (err) {
      console.error("[TransactionsService.importCsv]", err);
      return {
        success: false,
        error: "Failed to import CSV",
        code: "DB_ERROR",
      };
    }
  },
} as const;
