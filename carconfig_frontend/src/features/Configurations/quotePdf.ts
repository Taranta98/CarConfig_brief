import type { QuotePdfData } from "./configuration.type"

function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function buildPdfLines(data: QuotePdfData): string[] {
  const currency = (n: number) =>
    n.toLocaleString("it-IT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    })

  const lines = [
    "PREVENTIVO CONFIGURAZIONE",
    "",
    `Veicolo: ${data.vehicleLabel}`,
    data.vehicleDetails,
    "",
    `Prezzo base: ${currency(data.basePrice)}`,
  ]

  if (data.trimName) {
    lines.push(`Allestimento: ${data.trimName} (+${currency(data.trimPrice)})`)
  }

  if (data.optionals.length > 0) {
    lines.push("", "Optional:")
    for (const optional of data.optionals) {
      lines.push(`  - ${optional.name}: +${currency(optional.price)}`)
    }
    lines.push(`Totale optional: ${currency(data.optionalsTotal)}`)
  }

  lines.push("", `TOTALE: ${currency(data.total)}`, "", `Generato il ${data.generatedAt}`)

  return lines
}

/**
 * Minimal PDF 1.4 generator (text only, no external dependencies).
 */
export function createQuotePdfBlob(data: QuotePdfData): Blob {
  const lines = buildPdfLines(data)
  const fontSize = 11
  const lineHeight = 16
  const startY = 750
  const startX = 50

  const textOps = lines
    .map((line, index) => {
      const y = startY - index * lineHeight
      const text = line.length === 0 ? " " : escapePdfText(line)
      return `BT /F1 ${fontSize} Tf ${startX} ${y} Td (${text}) Tj ET`
    })
    .join("\n")

  const stream = `${textOps}\n`
  const streamLength = new TextEncoder().encode(stream).length

  const objects = [
    "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
    "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj",
    "4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj",
    `5 0 obj<</Length ${streamLength}>>stream\n${stream}endstream\nendobj`,
  ]

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = [0]

  for (const obj of objects) {
    offsets.push(pdf.length)
    pdf += `${obj}\n`
  }

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
  }
  pdf += `trailer<</Size ${objects.length + 1}/Root 1 0 R>>\n`
  pdf += `startxref\n${xrefOffset}\n%%EOF`

  return new Blob([pdf], { type: "application/pdf" })
}

export function downloadQuotePdf(data: QuotePdfData, filename: string): void {
  const blob = createQuotePdfBlob(data)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
