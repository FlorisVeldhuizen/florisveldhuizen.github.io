// Compares peachy-keen frame cost of the working tree against a git ref, scene by scene.
// Usage: npm run perf [-- --base origin/master --runs 2 --only orchard,disco]; PERF_DEBUG=1 prints forced-layout stacks.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : fallback;
};
const BASE_REF = option("base", "origin/master");
const RUNS = Number(option("runs", 2));
const ONLY = option("only", "")?.split(",").filter(Boolean);
const THROTTLE = 4;
const WINDOW_MS = 4000;
const TRACE_MS = 2000;

// A regression must be clearly slower, not page-load noise.
const TIMED = ["frameMs", "longFrames"];
const LIMITS = {
  frameMs: { ratio: 1.15, slack: 0.4 },
  forcedLayouts: { ratio: 1.5, slack: 0.05 },
  drawCalls: { ratio: 1.1, slack: 2 },
  audioNodes: { ratio: 1.25, slack: 20 },
  longFrames: { ratio: 1.5, slack: 1 },
};

if (!existsSync(join(here, "node_modules", "playwright"))) {
  console.log("Installing Playwright for the perf test (first run only)...");
  execFileSync("npm", ["install", "--no-package-lock", "--silent"], {
    cwd: here,
    stdio: "inherit",
  });
  execFileSync("npx", ["playwright", "install", "chromium"], {
    cwd: here,
    stdio: "inherit",
  });
}
const { chromium } = await import("playwright");

const NOW = Date.now();
const HELPERS_ALL = {
  feather: 50,
  admirer: 40,
  paddle: 30,
  masseuse: 25,
  baron: 20,
  coach: 15,
  choir: 10,
  spa: 10,
  press: 10,
  cult: 8,
  moon: 5,
  collider: 5,
  singularity: 3,
  peachverse: 3,
  paparazzi: 2,
  sugar: 2,
  reader: 1,
  fractal: 1,
  exe: 1,
};
const save = (helpers) => ({
  version: 3,
  juice: 1e30,
  juiceRun: 1e30,
  juiceTotal: 1e32,
  pits: 500,
  pitsTotal: 900,
  nectar: 400,
  nectarTotal: 2000,
  helpers,
  tree: ["root", "sleep", "start", "heat", "golden"],
  toys: ["talk", "mood", "disco", "lingerie"],
  orchard: {
    plots: Array.from({ length: 9 }, (_, i) => ({
      seed: ["cling", "free", "donut"][i % 3],
      plantedAt: NOW - [10, 600, 3000, 9000, 2e4, 6e4, 2e5, 4e5, 9e5][i] * 1000,
    })),
    discovered: ["cling", "free", "donut"],
    open: true,
  },
  stats: { bursts: 30, ripens: 2 },
  options: { helperStyle: "room" },
  savedAt: NOW,
  startedAt: NOW - 3600e3,
});
const SOME = { feather: 20, admirer: 10, paddle: 5, baron: 5 };

const tap = (selector) => (page) => page.locator(selector).tap();
const SCENES = {
  closed: { helpers: SOME },
  orchard: { helpers: SOME, act: tap("#tab-orchard") },
  ripen: { helpers: SOME, act: tap("#tab-ripen") },
  room: { helpers: HELPERS_ALL },
  disco: { helpers: SOME, settings: { disco: true } },
  burst: {
    helpers: SOME,
    act: (page) => page.evaluate(() => window.peachy?.burst?.()),
    needs: () => Boolean(window.peachy?.burst),
  },
};

function run(cmd, cmdArgs, cwd) {
  return execFileSync(cmd, cmdArgs, { cwd, encoding: "utf8" }).trim();
}

const freePort = () =>
  new Promise((resolve) => {
    const probe = createServer().listen(0, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });

async function startVite(root) {
  const port = await freePort();
  return new Promise((resolve, reject) => {
    const child = spawn(
      join(repo, "node_modules", ".bin", "vite"),
      ["--port", String(port), "--strictPort"],
      { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
    );
    let out = "";
    const onData = (chunk) => {
      out += chunk;
      const found = out.match(/http:\/\/localhost:(\d+)\//);
      if (found)
        resolve({ child, url: `http://localhost:${found[1]}/peachy-keen/` });
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("exit", () =>
      reject(new Error(`vite exited in ${root}:\n${out}`)),
    );
  });
}

// A layout with a script stack was forced by a read in frame code; the normal per-frame one has none.
function countPerFrame(events) {
  const frames = events.filter((e) => e.name === "FireAnimationFrame").length;
  const stackOf = (e) =>
    e.args?.beginData?.stackTrace ?? e.args?.data?.stackTrace;
  const forced = events.filter(
    (e) =>
      (e.name === "Layout" || e.name === "UpdateLayoutTree") &&
      stackOf(e)?.length,
  );
  if (process.env.PERF_DEBUG) {
    const by = {};
    forced.forEach((e) => {
      const where = stackOf(e)
        .slice(0, 3)
        .map(
          (f) =>
            `${f.functionName}@${f.url.split("/").pop().split("?")[0]}:${f.lineNumber}`,
        )
        .join(" < ");
      by[`${e.name} ${where}`] = (by[`${e.name} ${where}`] ?? 0) + 1;
    });
    console.log(by);
  }
  return frames ? forced.length / frames : 0;
}

async function measure(browser, url, scene) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  await context.addInitScript(
    ([state, settings]) => {
      if (sessionStorage.getItem("perf-seeded")) return;
      sessionStorage.setItem("perf-seeded", "1");
      localStorage.clear();
      localStorage.setItem("peachy-keen-mode", "idle");
      localStorage.setItem("peachy-keen-idle", JSON.stringify(state));
      localStorage.setItem(
        "peachy-keen-idle-settings",
        JSON.stringify({ talk: "off", achievements: false, ...settings }),
      );
      const count = (proto, names, key) =>
        names.forEach((name) => {
          const original = proto[name];
          // eslint-disable-next-line no-param-reassign
          proto[name] = function counted(...a) {
            window[key] = (window[key] ?? 0) + 1;
            return original.apply(this, a);
          };
        });
      count(
        WebGL2RenderingContext.prototype,
        [
          "drawElements",
          "drawArrays",
          "drawElementsInstanced",
          "drawArraysInstanced",
        ],
        "__perfDraws",
      );
      count(
        AudioContext.prototype,
        [
          "createOscillator",
          "createBiquadFilter",
          "createGain",
          "createBufferSource",
        ],
        "__perfNodes",
      );
    },
    [save(scene.helpers), scene.settings ?? {}],
  );
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page.waitForSelector("#intro.is-ready", { timeout: 120000 });
  const stage = await page.locator("#stage").boundingBox();
  await page.touchscreen.tap(
    stage.x + stage.width / 2,
    stage.y + stage.height * 0.45,
  );
  await page.waitForSelector("#intro", { state: "detached", timeout: 30000 });
  await page.waitForTimeout(3000);
  if (scene.needs && !(await page.evaluate(scene.needs))) {
    await context.close();
    return null;
  }
  await page.evaluate(() =>
    document.querySelectorAll(".toast-card").forEach((n) => n.remove()),
  );
  for (let n = 0; n < 6; n += 1) {
    // eslint-disable-next-line no-await-in-loop
    if (!(await page.locator(".ui.modal:not([hidden])").count())) break;
    // eslint-disable-next-line no-await-in-loop
    await page.keyboard.press("Escape");
    // eslint-disable-next-line no-await-in-loop
    await page.waitForTimeout(500);
  }
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });
  if (scene.act) await scene.act(page);
  await page.waitForTimeout(scene.act ? 600 : 1500);
  await page.evaluate(() => {
    window.__perfFrames = [];
    window.__perfDraws0 = window.__perfDraws ?? 0;
    window.__perfNodes0 = window.__perfNodes ?? 0;
    window.__perfT0 = performance.now();
    let last = performance.now();
    const tick = (t) => {
      window.__perfFrames.push(t - last);
      last = t;
      if (!window.__perfStop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.waitForTimeout(WINDOW_MS);
  const timing = await page.evaluate(() => {
    window.__perfStop = true;
    const f = window.__perfFrames.slice(1);
    const seconds = (performance.now() - window.__perfT0) / 1000;
    return {
      frameMs: f.reduce((a, b) => a + b, 0) / f.length,
      longFrames: f.filter((ms) => ms > 50).length,
      drawCalls: ((window.__perfDraws ?? 0) - window.__perfDraws0) / f.length,
      audioNodes: ((window.__perfNodes ?? 0) - window.__perfNodes0) / seconds,
    };
  });
  await browser.startTracing(page, {
    categories: [
      "devtools.timeline",
      "disabled-by-default-devtools.timeline.stack",
    ],
  });
  await page.waitForTimeout(TRACE_MS);
  const trace = JSON.parse((await browser.stopTracing()).toString());
  timing.forcedLayouts = countPerFrame(trace.traceEvents ?? trace);
  await context.close();
  if (errors.length) timing.errors = errors.slice(0, 3);
  return timing;
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const baseSha = run("git", ["rev-parse", "--short", BASE_REF], repo);
const baseDir = mkdtempSync(join(tmpdir(), "peachy-perf-base-"));
run("git", ["worktree", "add", "--detach", "--force", baseDir, BASE_REF], repo);
symlinkSync(join(repo, "node_modules"), join(baseDir, "node_modules"));
const servers = [];
const cleanUp = () => {
  servers.forEach((s) => s.child.kill());
  try {
    run("git", ["worktree", "remove", "--force", baseDir], repo);
  } catch {
    rmSync(baseDir, { recursive: true, force: true });
  }
};
process.on("SIGINT", () => {
  cleanUp();
  process.exit(130);
});

let failed = false;
try {
  const [base, current] = await Promise.all([
    startVite(baseDir),
    startVite(repo),
  ]);
  servers.push(base, current);
  const browser = await chromium.launch({
    args: [
      "--use-angle=metal",
      "--enable-gpu",
      "--ignore-gpu-blocklist",
      "--disable-gpu-vsync",
      "--disable-frame-rate-limit",
      "--autoplay-policy=no-user-gesture-required",
    ],
  });
  const names = Object.keys(SCENES).filter(
    (n) => !ONLY?.length || ONLY.includes(n),
  );
  console.log(
    `peachy-keen perf: working tree vs ${BASE_REF} (${baseSha}), ${RUNS} runs, CPU ${THROTTLE}x slower\n`,
  );
  for (const name of names) {
    const results = { base: [], current: [] };
    const measureRuns = async (runs) => {
      for (let r = 0; r < runs; r += 1)
        for (const side of r % 2 ? ["current", "base"] : ["base", "current"]) {
          const server = side === "base" ? base : current;
          // eslint-disable-next-line no-await-in-loop
          const m = await measure(browser, server.url, SCENES[name]);
          if (m) results[side].push(m);
          if (m?.errors)
            console.log(
              `  ${name} ${side} page errors: ${m.errors.join(" | ")}`,
            );
        }
    };
    const worseKeys = () =>
      Object.entries(LIMITS)
        .filter(([key, { ratio, slack }]) => {
          const b = median(results.base.map((m) => m[key]));
          const c = median(results.current.map((m) => m[key]));
          return c > b * ratio && c - b > slack;
        })
        .map(([key]) => key);
    // eslint-disable-next-line no-await-in-loop
    await measureRuns(RUNS);
    if (!results.base.length || !results.current.length) {
      console.log(`${name.padEnd(8)} skipped (not available on one side)`);
      continue;
    }
    // Timings vary between page loads, so a slower timing is measured again before it counts.
    if (worseKeys().some((key) => TIMED.includes(key)))
      // eslint-disable-next-line no-await-in-loop
      await measureRuns(RUNS * 2);
    const worse = worseKeys();
    if (worse.length) failed = true;
    const cells = Object.keys(LIMITS).map((key) => {
      const b = median(results.base.map((m) => m[key]));
      const c = median(results.current.map((m) => m[key]));
      return `${key} ${b.toFixed(2)} → ${c.toFixed(2)}${worse.includes(key) ? " ✗" : ""}`;
    });
    console.log(`${name.padEnd(8)} ${cells.join("   ")}`);
  }
  await browser.close();
} finally {
  cleanUp();
}
console.log(failed ? "\nRegression found (✗)." : "\nNo regressions.");
process.exit(failed ? 1 : 0);
