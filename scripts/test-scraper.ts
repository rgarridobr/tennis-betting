import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  fetchAtpDraw,
  findAtpPlayerMatch,
  type ExistingPlayer,
} from "../lib/services/atp-draw";

async function test() {
  const atpId = process.argv[2] ?? "321";
  const year = Number(process.argv[3] ?? new Date().getFullYear());
  const slug = process.argv[4] ?? "atp-draw";
  const matches = await fetchAtpDraw(atpId, year, slug);
  const players = matches.flatMap((match) =>
    match.players.map((player, slotIndex) => ({
      drawPosition: match.matchIndex * 2 + slotIndex + 1,
      matchIndex: match.matchIndex,
      ...player,
    })),
  );
  let savePreview:
    | Array<{
        drawPosition: number;
        pdfName: string;
        savedName: string;
        playerId: number | null;
        action: "MATCH_EXISTING" | "CREATE" | "BYE";
      }>
    | undefined;

  if (process.argv.includes("--db")) {
    await import("dotenv/config");
    const { sql } = await import("../lib/db");
    const existingPlayers = (await sql`
        SELECT id, name, display_name, country
        FROM players
      `) as ExistingPlayer[];

    savePreview = players.map((player) => {
      if (player.type === "BYE") {
        return {
          drawPosition: player.drawPosition,
          pdfName: player.name,
          savedName: "BYE",
          playerId: null,
          action: "BYE" as const,
        };
      }

      const matched = findAtpPlayerMatch(
        player.name,
        player.country,
        existingPlayers,
      );

      return {
        drawPosition: player.drawPosition,
        pdfName: player.name,
        savedName: matched?.name ?? player.name,
        playerId: matched?.id ?? null,
        action: matched
          ? ("MATCH_EXISTING" as const)
          : ("CREATE" as const),
      };
    });
  }

  const output = {
    source: `https://www.protennislive.com/posting/${year}/${atpId}/mds.pdf`,
    matchCount: matches.length,
    playerSlotCount: players.length,
    players,
    savePreview,
    matches,
  };
  const outputPath = resolve(
    "tmp",
    `atp-draw-${year}-${atpId}.json`,
  );

  await mkdir(resolve("tmp"), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`JSON salvo em ${outputPath}`);
  console.log(JSON.stringify(output, null, 2));
}

test().catch((error) => {
  console.error("Falha no teste do chaveamento ATP:", error);
  process.exitCode = 1;
});
