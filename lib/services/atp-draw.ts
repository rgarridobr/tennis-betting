const PDFParser = require("pdf2json");

export interface AtpMatchPlayer {
  name: string;
  href: string | null;
  seed: string | null;
  country: string | null;
  type: "PLAYER" | "SEED" | "QUALIFIER" | "WILD_CARD" | "LUCKY_LOSER" | "BYE";
}

export interface AtpMatch {
  matchIndex: number;
  players: AtpMatchPlayer[];
}

export interface ExistingPlayer {
  id: number;
  name: string;
  display_name?: string | null;
  country?: string | null;
}

type PdfTextItem = {
  x: number;
  y: number;
  text: string;
};

type PdfPage = {
  Texts?: Array<{
    x: number;
    y: number;
    R?: Array<{ T?: string }>;
  }>;
};

type PdfData = {
  Pages?: PdfPage[];
};

type DrawRow = {
  position: number;
  seedOrEntry: string | null;
  rawName: string;
  country: string | null;
};

const POSITION_MAX_X = 1.5;
const ENTRY_MIN_X = 1.5;
const PLAYER_MIN_X = 3.0;
const COUNTRY_MIN_X = 7.7;
const COUNTRY_MAX_X = 9.2;
const SAME_ROW_TOLERANCE = 0.06;

export async function fetchAtpDraw(
  atpId: string,
  year: number,
  _slug: string,
): Promise<AtpMatch[]> {
  const pdfUrl = `https://www.protennislive.com/posting/${year}/${atpId}/mds.pdf`;

  const response = await fetch(pdfUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/pdf",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Erro ao baixar PDF do chaveamento: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return parseAtpDrawPdfBuffer(buffer);
}

export async function parseAtpDrawPdfBuffer(buffer: Buffer): Promise<AtpMatch[]> {
  const pdfData = await parsePdf(buffer);

  return parseAtpDrawPdf(pdfData);
}

export function findAtpPlayerMatch(
  atpName: string,
  country: string | null,
  players: ExistingPlayer[],
): ExistingPlayer | undefined {
  const normalizedAtp = normalizeForMatch(atpName);
  const exactMatch = players.find((player) => {
    const dbName = normalizeForMatch(player.name || "");
    const dbDisplayName = normalizeForMatch(player.display_name || "");

    return dbName === normalizedAtp || dbDisplayName === normalizedAtp;
  });

  if (exactMatch || !atpName.includes("…")) {
    return exactMatch;
  }

  const reliableTokens = atpName
    .split(/[\s,]+/)
    .filter((token) => token.length >= 3 && !token.includes("…"))
    .map(normalizeForMatch)
    .filter(Boolean);
  const partialMatches = players.filter((player) => {
    if (country && player.country && player.country !== country) {
      return false;
    }

    const dbName = normalizeForMatch(
      `${player.name || ""} ${player.display_name || ""}`,
    );

    return reliableTokens.every((token) => dbName.includes(token));
  });

  return partialMatches.length === 1 ? partialMatches[0] : undefined;
}

function parsePdf(buffer: Buffer): Promise<PdfData> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: PdfData) => {
      resolve(pdfData);
    });

    pdfParser.parseBuffer(buffer);
  });
}

/**
 * ATP PDFs split words whenever the font/style changes. For example, Shelton
 * can arrive as three positioned fragments: "SHEL", "T", "ON". Rebuilding
 * rows by their PDF coordinates lets us concatenate those fragments without
 * inventing spaces and keeps later-round text out of the first-round draw.
 */
export function parseAtpDrawPdf(pdfData: PdfData): AtpMatch[] {
  const rows = (pdfData.Pages ?? [])
    .flatMap((page) => parseDrawRows(page))
    .sort((a, b) => a.position - b.position);

  if (rows.length === 0) {
    return [];
  }

  const uniqueRows = new Map<number, DrawRow>();
  for (const row of rows) {
    if (!uniqueRows.has(row.position)) {
      uniqueRows.set(row.position, row);
    }
  }

  const orderedRows = [...uniqueRows.values()].sort(
    (a, b) => a.position - b.position,
  );
  const maxPosition = orderedRows.at(-1)?.position ?? 0;

  if (orderedRows.length !== maxPosition) {
    const found = new Set(orderedRows.map((row) => row.position));
    const missing = Array.from({ length: maxPosition }, (_, index) => index + 1)
      .filter((position) => !found.has(position));

    throw new Error(
      `PDF ATP incompleto: ${orderedRows.length}/${maxPosition} posições encontradas. Ausentes: ${missing.join(", ")}`,
    );
  }

  const players = orderedRows.map(parsePlayerRow);
  const matches: AtpMatch[] = [];

  for (let index = 0; index < players.length; index += 2) {
    matches.push({
      matchIndex: index / 2,
      players: players.slice(index, index + 2),
    });
  }

  return matches;
}

function parseDrawRows(page: PdfPage): DrawRow[] {
  const items = (page.Texts ?? []).map(decodeTextItem);

  const positionItems = items.filter(
    (item) =>
      item.x < POSITION_MAX_X &&
      /^[1-9]\d*$/.test(item.text.trim()),
  );

  return positionItems.flatMap((positionItem) => {
    const positionOnPage = Number(positionItem.text.trim());
    const rowItems = items
      .filter((item) => Math.abs(item.y - positionItem.y) <= SAME_ROW_TOLERANCE)
      .sort((a, b) => a.x - b.x);

    const name = joinFragments(
      rowItems.filter(
        (item) => item.x >= PLAYER_MIN_X && item.x < COUNTRY_MIN_X,
      ),
    );
    const countryText = joinFragments(
      rowItems.filter(
        (item) => item.x >= COUNTRY_MIN_X && item.x < COUNTRY_MAX_X,
      ),
    ).replace(/\s+/g, "");
    const seedOrEntry =
      joinFragments(
        rowItems.filter(
          (item) => item.x >= ENTRY_MIN_X && item.x < PLAYER_MIN_X,
        ),
      ).replace(/\s+/g, "") || null;

    if (!name) {
      return [];
    }

    return [
      {
        position: positionOnPage,
        seedOrEntry,
        rawName: name,
        country: /^[A-Z]{3}$/.test(countryText) ? countryText : null,
      },
    ];
  });
}

function decodeTextItem(item: NonNullable<PdfPage["Texts"]>[number]): PdfTextItem {
  const encoded = (item.R ?? []).map((run) => run.T ?? "").join("");

  return {
    x: item.x,
    y: item.y,
    text: decodePdfText(encoded),
  };
}

function decodePdfText(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeForMatch(value: string): string {
  return value
    .toLocaleLowerCase("en")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

function joinFragments(items: PdfTextItem[]): string {
  return items.map((item) => item.text).join("").trim();
}

function parsePlayerRow(row: DrawRow): AtpMatchPlayer {
  const entry = row.seedOrEntry?.toUpperCase() ?? null;

  if (row.rawName.toLowerCase() === "bye") {
    return {
      name: "BYE",
      href: null,
      seed: null,
      country: null,
      type: "BYE",
    };
  }

  let type: AtpMatchPlayer["type"] = "PLAYER";

  if (entry && /^\d+$/.test(entry)) type = "SEED";
  if (entry === "Q") type = "QUALIFIER";
  if (entry === "WC") type = "WILD_CARD";
  if (entry === "LL") type = "LUCKY_LOSER";

  return {
    name: normalizePdfPlayerName(row.rawName),
    href: null,
    seed: entry,
    country: row.country,
    type,
  };
}

function normalizePdfPlayerName(name: string): string {
  const cleaned = name
    .replace(/â€¦/g, "")
    .replace(/\s+,/g, ",")
    .replace(/,\s+/g, ", ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned.includes(",")) {
    return titleCase(cleaned);
  }

  const commaIndex = cleaned.indexOf(",");
  const last = cleaned.slice(0, commaIndex).trim();
  const first = cleaned.slice(commaIndex + 1).trim();

  return titleCase(`${first} ${last}`);
}

function titleCase(value: string): string {
  return value
    .toLocaleLowerCase("en")
    .replace(/(^|[\s'-])\p{L}/gu, (match) => match.toLocaleUpperCase("en"))
    .replace(
      /\bMc(\p{L})/gu,
      (_, letter: string) => `Mc${letter.toLocaleUpperCase("en")}`,
    )
    .trim();
}
