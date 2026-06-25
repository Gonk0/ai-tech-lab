"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

const easeOut = [0.22, 1, 0.36, 1] as const;

const GRID_SIZE = 5;
const OPPOSITE = [2, 3, 0, 1] as const;
const DELTAS = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
] as const;

type TileType = "source" | "target" | "line" | "corner" | "tee" | "cross" | "block";

type Tile = {
  type: TileType;
  rotation: number;
  locked?: boolean;
};

type RouterLevel = {
  name: string;
  moves: number;
  tiles: Tile[];
};

const BASE_PORTS: Record<TileType, number[]> = {
  source: [1],
  target: [3],
  line: [0, 2],
  corner: [0, 1],
  tee: [0, 1, 2],
  cross: [0, 1, 2, 3],
  block: [],
};

const ROUTER_LEVELS: RouterLevel[] = [
  {
    name: "Dual endpoint mesh",
    moves: 16,
    tiles: [
      { type: "source", rotation: 0, locked: true },
      { type: "line", rotation: 0 },
      { type: "corner", rotation: 0 },
      { type: "block", rotation: 0, locked: true },
      { type: "corner", rotation: 3 },
      { type: "corner", rotation: 2 },
      { type: "block", rotation: 0, locked: true },
      { type: "line", rotation: 1 },
      { type: "tee", rotation: 2 },
      { type: "line", rotation: 0 },
      { type: "line", rotation: 1 },
      { type: "corner", rotation: 1 },
      { type: "tee", rotation: 2 },
      { type: "line", rotation: 0 },
      { type: "target", rotation: 0, locked: true },
      { type: "block", rotation: 0, locked: true },
      { type: "corner", rotation: 0 },
      { type: "line", rotation: 1 },
      { type: "corner", rotation: 3 },
      { type: "tee", rotation: 1 },
      { type: "corner", rotation: 1 },
      { type: "line", rotation: 0 },
      { type: "corner", rotation: 2 },
      { type: "line", rotation: 0 },
      { type: "target", rotation: 0, locked: true },
    ],
  },
  {
    name: "Three-node relay",
    moves: 22,
    tiles: [
      { type: "source", rotation: 0, locked: true },
      { type: "corner", rotation: 1 },
      { type: "tee", rotation: 1 },
      { type: "line", rotation: 0 },
      { type: "target", rotation: 0, locked: true },
      { type: "block", rotation: 0, locked: true },
      { type: "line", rotation: 1 },
      { type: "corner", rotation: 3 },
      { type: "line", rotation: 1 },
      { type: "corner", rotation: 2 },
      { type: "target", rotation: 1, locked: true },
      { type: "tee", rotation: 3 },
      { type: "cross", rotation: 0 },
      { type: "corner", rotation: 1 },
      { type: "block", rotation: 0, locked: true },
      { type: "corner", rotation: 0 },
      { type: "line", rotation: 0 },
      { type: "tee", rotation: 2 },
      { type: "line", rotation: 1 },
      { type: "target", rotation: 0, locked: true },
      { type: "line", rotation: 1 },
      { type: "corner", rotation: 2 },
      { type: "block", rotation: 0, locked: true },
      { type: "corner", rotation: 0 },
      { type: "line", rotation: 1 },
    ],
  },
];

const SYMBOLS = ["CORE", "AGNT", "MEM", "TOOL", "CHK", "SYNC"] as const;
const PROTOCOL_CODES = [
  ["CORE", "MEM", "TOOL", "CHK"],
  ["AGNT", "TOOL", "MEM", "SYNC"],
  ["SYNC", "CORE", "CORE", "CHK"],
] as const;

type SymbolCode = (typeof SYMBOLS)[number];
type Attempt = {
  guess: SymbolCode[];
  exact: number;
  misplaced: number;
};

export default function LabPage() {
  const { t } = useLanguage();
  const l = t.lab;

  return (
    <main className="relative z-10 px-6 pb-28 pt-32 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="mb-14"
        >
          <p className="mb-5 text-[10px] uppercase tracking-[0.28em] text-white/22">{l.eyebrow}</p>
          <h1 className="max-w-4xl text-[clamp(3rem,7vw,7.2rem)] font-black leading-[0.9] tracking-[-0.05em] text-white">
            {l.headline}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-[1.78] text-white/42 md:text-lg">{l.intro}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.8, ease: easeOut }}
          className="mb-8 overflow-hidden rounded-3xl border border-white/[0.075] bg-white/[0.032] backdrop-blur-xl"
        >
          <Link href="/lab/space" className="group block p-6 md:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-blue-200/42">
                  {l.spaceEyebrow}
                </p>
                <h2 className="text-3xl font-black tracking-[-0.035em] text-white md:text-5xl">
                  {l.spaceHeadline}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/38">{l.spaceIntro}</p>
              </div>
              <span className="text-3xl text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </div>
          </Link>
        </motion.div>

        <div className="grid gap-5 xl:grid-cols-2">
          <QuantumRouter />
          <ProtocolBreaker />
        </div>
      </div>
    </main>
  );
}

function QuantumRouter() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>(() => cloneTiles(ROUTER_LEVELS[0]!.tiles));
  const [moves, setMoves] = useState(0);
  const level = ROUTER_LEVELS[levelIndex]!;
  const analysis = useMemo(() => analyzeNetwork(tiles), [tiles]);
  const solved = analysis.targetIndexes.every((target) => analysis.energized.has(target));
  const efficiency = Math.max(0, Math.round(100 - (moves / level.moves) * 100));

  const rotateTile = (index: number) => {
    if (tiles[index]?.locked || solved) return;
    setTiles((current) =>
      current.map((tile, tileIndex) =>
        tileIndex === index ? { ...tile, rotation: (tile.rotation + 1) % 4 } : tile,
      ),
    );
    setMoves((value) => value + 1);
  };

  const reset = () => {
    setTiles(cloneTiles(level.tiles));
    setMoves(0);
  };

  const nextLevel = () => {
    const next = (levelIndex + 1) % ROUTER_LEVELS.length;
    setLevelIndex(next);
    setTiles(cloneTiles(ROUTER_LEVELS[next]!.tiles));
    setMoves(0);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.85, ease: easeOut }}
      className="overflow-hidden rounded-3xl border border-white/[0.075] bg-white/[0.032] p-6 backdrop-blur-xl"
    >
      <GameHeader
        eyebrow="Game 01 / Spatial logic"
        title="Quantum Router"
        description="Rotate modules until the source powers every endpoint. A valid connection needs matching ports on both neighboring tiles."
      />

      <div className="mb-6 grid grid-cols-4 gap-px bg-white/[0.055]">
        {[
          ["Level", `${levelIndex + 1}/${ROUTER_LEVELS.length}`],
          ["Moves", moves],
          ["Linked", `${analysis.linkedTargets}/${analysis.targetIndexes.length}`],
          ["Efficiency", `${efficiency}%`],
        ].map(([label, value]) => (
          <Stat key={label} label={String(label)} value={String(value)} />
        ))}
      </div>

      <div className="mb-6 rounded-3xl border border-white/[0.07] bg-[#050512]/76 p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/28">{level.name}</p>
          <p className={solved ? "text-sm text-emerald-300" : "text-sm text-white/34"}>
            {solved ? "Network synchronized" : "Rotate the network"}
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {tiles.map((tile, index) => {
            const ports = getPorts(tile);
            const energized = analysis.energized.has(index);
            return (
              <button
                key={index}
                type="button"
                onClick={() => rotateTile(index)}
                className={`relative aspect-square rounded-2xl border transition-all duration-200 ${
                  tile.type === "block"
                    ? "border-white/[0.035] bg-black/30"
                    : energized
                      ? "border-blue-200/44 bg-blue-400/[0.16] shadow-[0_0_32px_rgba(80,130,255,0.22)]"
                      : "border-white/[0.075] bg-white/[0.028] hover:border-white/18 hover:bg-white/[0.055]"
                }`}
                aria-label={`${tile.type} tile`}
              >
                <TileGraphic tile={tile} ports={ports} energized={energized} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="border border-white/[0.1] px-5 py-3 text-sm text-white/50 transition-colors hover:border-white/24 hover:text-white"
        >
          Reset grid
        </button>
        <button
          type="button"
          onClick={nextLevel}
          className="bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
        >
          {solved ? "Next circuit" : "Switch circuit"}
        </button>
      </div>
    </motion.section>
  );
}

function ProtocolBreaker() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [guess, setGuess] = useState<SymbolCode[]>(["CORE", "CORE", "CORE", "CORE"]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const code = PROTOCOL_CODES[levelIndex] as readonly SymbolCode[];
  const solved = attempts.some((attempt) => attempt.exact === code.length);
  const locked = attempts.length >= 8 && !solved;

  const setSlot = (slot: number, value: SymbolCode) => {
    if (solved || locked) return;
    setGuess((current) => current.map((symbol, index) => (index === slot ? value : symbol)));
  };

  const submit = () => {
    if (solved || locked) return;
    const result = scoreGuess(guess, code);
    setAttempts((current) => [{ guess, ...result }, ...current].slice(0, 8));
  };

  const reset = () => {
    setGuess(["CORE", "CORE", "CORE", "CORE"]);
    setAttempts([]);
  };

  const nextProtocol = () => {
    const next = (levelIndex + 1) % PROTOCOL_CODES.length;
    setLevelIndex(next);
    setGuess(["CORE", "CORE", "CORE", "CORE"]);
    setAttempts([]);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.85, ease: easeOut }}
      className="overflow-hidden rounded-3xl border border-white/[0.075] bg-white/[0.032] p-6 backdrop-blur-xl"
    >
      <GameHeader
        eyebrow="Game 02 / Deduction"
        title="Protocol Breaker"
        description="Crack the hidden four-step protocol. Exact means right symbol and slot. Misplaced means the symbol exists, but in another slot."
      />

      <div className="mb-6 grid grid-cols-4 gap-px bg-white/[0.055]">
        {[
          ["Protocol", `${levelIndex + 1}/${PROTOCOL_CODES.length}`],
          ["Attempts", `${attempts.length}/8`],
          ["Status", solved ? "Solved" : locked ? "Locked" : "Open"],
          ["Mode", "Duplicates"],
        ].map(([label, value]) => (
          <Stat key={label} label={String(label)} value={String(value)} />
        ))}
      </div>

      <div className="mb-5 rounded-3xl border border-white/[0.07] bg-[#050512]/76 p-5">
        <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-white/26">Candidate sequence</p>
        <div className="grid gap-3 md:grid-cols-4">
          {guess.map((symbol, slot) => (
            <div key={slot} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
              <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/18">
                Slot {slot + 1}
              </p>
              <select
                value={symbol}
                onChange={(event) => setSlot(slot, event.target.value as SymbolCode)}
                className="w-full border border-white/[0.1] bg-[#050512] px-3 py-3 text-sm text-white outline-none"
                disabled={solved || locked}
              >
                {SYMBOLS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={solved || locked}
            className="bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Submit protocol
          </button>
          <button
            type="button"
            onClick={reset}
            className="border border-white/[0.1] px-5 py-3 text-sm text-white/50 transition-colors hover:border-white/24 hover:text-white"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={nextProtocol}
            className="border border-blue-200/20 px-5 py-3 text-sm text-blue-100/58 transition-colors hover:border-blue-200/40 hover:text-blue-100"
          >
            Next protocol
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        {attempts.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.065] bg-white/[0.02] p-5 text-sm text-white/34">
            No attempts yet. Start with a hypothesis and refine from feedback.
          </div>
        ) : (
          attempts.map((attempt, index) => (
            <div
              key={`${attempt.guess.join("-")}-${index}`}
              className="grid gap-3 rounded-2xl border border-white/[0.065] bg-white/[0.02] p-4 md:grid-cols-[1fr_0.5fr]"
            >
              <div className="flex flex-wrap gap-2">
                {attempt.guess.map((symbol, slot) => (
                  <span
                    key={`${symbol}-${slot}`}
                    className="border border-white/[0.09] px-3 py-1.5 text-xs text-white/60"
                  >
                    {symbol}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-start gap-4 text-xs uppercase tracking-[0.16em] md:justify-end">
                <span className="text-emerald-300/80">Exact {attempt.exact}</span>
                <span className="text-blue-200/68">Misplaced {attempt.misplaced}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
}

function GameHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-blue-200/42">{eyebrow}</p>
      <h2 className="text-2xl font-bold text-white md:text-3xl">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-white/38">{description}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#050512]/88 p-4">
      <div className="text-lg font-semibold text-white md:text-xl">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/24">{label}</div>
    </div>
  );
}

function TileGraphic({
  tile,
  ports,
  energized,
}: {
  tile: Tile;
  ports: number[];
  energized: boolean;
}) {
  if (tile.type === "block") {
    return <span className="absolute inset-4 rounded-xl bg-white/[0.025]" />;
  }

  const color = energized ? "bg-blue-100 shadow-[0_0_18px_rgba(147,197,253,0.8)]" : "bg-white/28";

  return (
    <>
      {ports.includes(0) ? (
        <span className={`absolute left-1/2 top-2 h-[calc(50%-0.5rem)] w-1 -translate-x-1/2 rounded-full ${color}`} />
      ) : null}
      {ports.includes(1) ? (
        <span className={`absolute right-2 top-1/2 h-1 w-[calc(50%-0.5rem)] -translate-y-1/2 rounded-full ${color}`} />
      ) : null}
      {ports.includes(2) ? (
        <span className={`absolute bottom-2 left-1/2 h-[calc(50%-0.5rem)] w-1 -translate-x-1/2 rounded-full ${color}`} />
      ) : null}
      {ports.includes(3) ? (
        <span className={`absolute left-2 top-1/2 h-1 w-[calc(50%-0.5rem)] -translate-y-1/2 rounded-full ${color}`} />
      ) : null}
      <span
        className={`absolute left-1/2 top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[9px] font-bold uppercase ${
          tile.type === "source"
            ? "border-emerald-300/50 bg-emerald-400/16 text-emerald-200"
            : tile.type === "target"
              ? "border-blue-200/50 bg-blue-400/16 text-blue-100"
              : "border-white/10 bg-[#050512] text-white/22"
        }`}
      >
        {tile.type === "source" ? "S" : tile.type === "target" ? "T" : ""}
      </span>
    </>
  );
}

function cloneTiles(tiles: Tile[]) {
  return tiles.map((tile) => ({ ...tile }));
}

function getPorts(tile: Tile) {
  return BASE_PORTS[tile.type].map((port) => (port + tile.rotation) % 4);
}

function analyzeNetwork(tiles: Tile[]) {
  const sourceIndex = tiles.findIndex((tile) => tile.type === "source");
  const targetIndexes = tiles
    .map((tile, index) => (tile.type === "target" ? index : -1))
    .filter((index) => index >= 0);
  const energized = new Set<number>();
  const queue = [sourceIndex];

  if (sourceIndex >= 0) energized.add(sourceIndex);

  while (queue.length > 0) {
    const currentIndex = queue.shift()!;
    const current = tiles[currentIndex]!;
    const currentRow = Math.floor(currentIndex / GRID_SIZE);
    const currentCol = currentIndex % GRID_SIZE;

    for (const direction of getPorts(current)) {
      const [rowDelta, colDelta] = DELTAS[direction]!;
      const nextRow = currentRow + rowDelta;
      const nextCol = currentCol + colDelta;

      if (nextRow < 0 || nextRow >= GRID_SIZE || nextCol < 0 || nextCol >= GRID_SIZE) continue;

      const nextIndex = nextRow * GRID_SIZE + nextCol;
      const next = tiles[nextIndex]!;

      if (next.type === "block" || energized.has(nextIndex)) continue;
      if (!getPorts(next).includes(OPPOSITE[direction])) continue;

      energized.add(nextIndex);
      queue.push(nextIndex);
    }
  }

  return {
    energized,
    targetIndexes,
    linkedTargets: targetIndexes.filter((target) => energized.has(target)).length,
  };
}

function scoreGuess(guess: SymbolCode[], code: readonly SymbolCode[]) {
  let exact = 0;
  const remainingGuess: SymbolCode[] = [];
  const remainingCode: SymbolCode[] = [];

  for (let index = 0; index < code.length; index += 1) {
    if (guess[index] === code[index]) {
      exact += 1;
    } else {
      remainingGuess.push(guess[index]!);
      remainingCode.push(code[index]!);
    }
  }

  let misplaced = 0;
  const used = new Set<number>();

  for (const symbol of remainingGuess) {
    const foundIndex = remainingCode.findIndex((candidate, index) => candidate === symbol && !used.has(index));
    if (foundIndex >= 0) {
      used.add(foundIndex);
      misplaced += 1;
    }
  }

  return { exact, misplaced };
}
