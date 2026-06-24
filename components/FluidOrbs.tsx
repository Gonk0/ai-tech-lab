"use client";

import { useEffect, useRef, useState } from "react";

type Node = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  hue: number;
  pulse: number;
};

type Wave = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  force: number;
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
};

export function FluidOrbs() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const telemetryRef = useRef({ charge: 0, pulses: 0, links: 0, mode: "BEND" });
  const [telemetry, setTelemetry] = useState({ charge: 0, pulses: 0, links: 0, mode: "BEND" });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let animationFrame = 0;
    let lastTelemetrySync = 0;
    let nodes: Node[] = [];
    const waves: Wave[] = [];
    const sparks: Spark[] = [];
    const mouse = {
      x: -9999,
      y: -9999,
      active: false,
      down: false,
      downAt: 0,
      charge: 0,
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(145, Math.max(78, Math.floor((width * height) / 12800)));
      nodes = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.24 + Math.random() * 0.95,
        vx: (Math.random() - 0.5) * 0.36,
        vy: (Math.random() - 0.5) * 0.36,
        hue: index % 5 === 0 ? 265 : index % 3 === 0 ? 218 : 188,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const spawnSparks = (x: number, y: number, amount: number, power: number) => {
      for (let i = 0; i < amount; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.8 + Math.random() * 4.2) * power;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          hue: Math.random() > 0.5 ? 198 : 262,
        });
      }
    };

    const drawSoftGrid = () => {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "rgba(140, 170, 255, 0.16)";
      ctx.lineWidth = 1;

      const grid = 86;
      const bendX = mouse.active ? (mouse.x - width / 2) * 0.018 : 0;
      const bendY = mouse.active ? (mouse.y - height / 2) * 0.018 : 0;

      for (let x = -grid; x < width + grid; x += grid) {
        ctx.beginPath();
        for (let y = -grid; y < height + grid; y += 18) {
          const wave = Math.sin((y + frame * 0.6) * 0.012 + x * 0.01) * 7;
          const pull = mouse.active ? Math.max(0, 1 - Math.hypot(x - mouse.x, y - mouse.y) / 520) : 0;
          const px = x + wave + bendX * pull;
          const py = y + bendY * pull;
          if (y === -grid) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      for (let y = -grid; y < height + grid; y += grid) {
        ctx.beginPath();
        for (let x = -grid; x < width + grid; x += 18) {
          const wave = Math.cos((x + frame * 0.5) * 0.011 + y * 0.012) * 7;
          const pull = mouse.active ? Math.max(0, 1 - Math.hypot(x - mouse.x, y - mouse.y) / 520) : 0;
          const px = x + bendX * pull;
          const py = y + wave + bendY * pull;
          if (x === -grid) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      ctx.restore();
    };

    const draw = (now: number) => {
      frame += 1;
      ctx.fillStyle = "#03030a";
      ctx.fillRect(0, 0, width, height);

      const nebula = ctx.createRadialGradient(width * 0.52, height * 0.34, 0, width * 0.52, height * 0.34, Math.max(width, height) * 0.9);
      nebula.addColorStop(0, "rgba(20, 38, 110, 0.48)");
      nebula.addColorStop(0.42, "rgba(17, 24, 80, 0.18)");
      nebula.addColorStop(1, "#03030a");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);

      drawSoftGrid();

      if (mouse.down) {
        mouse.charge = Math.min(1, (performance.now() - mouse.downAt) / 1200);
      } else {
        mouse.charge *= 0.9;
      }

      let linkCount = 0;
      for (const node of nodes) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const distance = Math.hypot(dx, dy) || 1;
        const fieldRadius = mouse.down ? 520 : 280;

        if (mouse.active && distance < fieldRadius) {
          const force = (1 - distance / fieldRadius) * (mouse.down ? -0.075 : 0.052);
          node.vx += (dx / distance) * force;
          node.vy += (dy / distance) * force;
          node.pulse += 0.05;
        }

        for (const wave of waves) {
          const wx = node.x - wave.x;
          const wy = node.y - wave.y;
          const wd = Math.hypot(wx, wy) || 1;
          const shell = Math.abs(wd - wave.radius);

          if (shell < 62) {
            const push = (1 - shell / 62) * wave.force * wave.alpha;
            node.vx += (wx / wd) * push;
            node.vy += (wy / wd) * push;
            node.pulse += push * 0.4;
          }
        }

        node.x += node.vx * (0.7 + node.z);
        node.y += node.vy * (0.7 + node.z);
        node.vx *= 0.986;
        node.vy *= 0.986;
        node.pulse += 0.02 + node.z * 0.006;

        if (node.x < -30) node.x = width + 30;
        if (node.x > width + 30) node.x = -30;
        if (node.y < -30) node.y = height + 30;
        if (node.y > height + 30) node.y = -30;
      }

      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          const limit = 112 * ((a.z + b.z) / 2);

          if (dist < limit) {
            const alpha = (1 - dist / limit) * 0.42;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `hsla(${a.hue}, 100%, 68%, ${alpha})`);
            grad.addColorStop(1, `hsla(${b.hue}, 100%, 68%, ${alpha})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.55 + a.z * 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            linkCount += 1;
          }
        }

        const glow = 0.48 + Math.sin(a.pulse) * 0.22;
        ctx.shadowColor = `hsla(${a.hue}, 100%, 66%, 0.75)`;
        ctx.shadowBlur = 16;
        ctx.fillStyle = `hsla(${a.hue}, 100%, 68%, ${glow})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.2 + a.z * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (let i = waves.length - 1; i >= 0; i -= 1) {
        const wave = waves[i]!;
        wave.radius += 8 + wave.force * 7;
        wave.alpha *= 0.935;
        if (wave.alpha < 0.008) {
          waves.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(140, 170, 255, ${wave.alpha})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i]!;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.978;
        spark.vy *= 0.978;
        spark.life *= 0.956;
        if (spark.life < 0.02) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `hsla(${spark.hue}, 100%, 72%, ${spark.life})`;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 1.4 + spark.life * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (mouse.active) {
        ctx.strokeStyle = `rgba(190, 210, 255, ${0.12 + mouse.charge * 0.24})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 36 + mouse.charge * 120, 0, Math.PI * 2);
        ctx.stroke();
      }

      const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.74);
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(0.58, "rgba(3, 3, 10, 0.05)");
      vignette.addColorStop(1, "rgba(3, 3, 10, 0.92)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      telemetryRef.current = {
        charge: Math.round(mouse.charge * 100),
        pulses: telemetryRef.current.pulses,
        links: linkCount,
        mode: mouse.down ? "CHARGE" : mouse.active ? "BEND" : "IDLE",
      };

      if (now - lastTelemetrySync > 180) {
        setTelemetry({ ...telemetryRef.current });
        lastTelemetrySync = now;
      }

      animationFrame = requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    };

    const onPointerDown = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
      mouse.down = true;
      mouse.downAt = performance.now();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!mouse.down) return;

      const charge = Math.min(1, (performance.now() - mouse.downAt) / 1200);
      const force = 0.7 + charge * 2.3;
      waves.push({ x: event.clientX, y: event.clientY, radius: 8, alpha: 0.5 + charge * 0.42, force });
      waves.push({ x: event.clientX, y: event.clientY, radius: 52, alpha: 0.22 + charge * 0.22, force: force * 0.55 });
      spawnSparks(event.clientX, event.clientY, Math.round(10 + charge * 42), force);
      telemetryRef.current.pulses += 1;
      mouse.down = false;
    };

    const onPointerLeave = () => {
      mouse.active = false;
      mouse.down = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    animationFrame = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 z-0"
        style={{ pointerEvents: "none" }}
      />
      <div className="pointer-events-none fixed bottom-5 right-5 z-20 hidden w-64 border border-white/[0.07] bg-black/20 p-4 text-[10px] uppercase tracking-[0.2em] text-white/34 backdrop-blur-xl md:block">
        <div className="mb-3 flex items-center justify-between text-white/55">
          <span>Quantum Field</span>
          <span>{telemetry.mode}</span>
        </div>
        <div className="mb-2 h-px bg-white/[0.08]" />
        <p>Move: bend the network</p>
        <p>Hold: charge gravity</p>
        <p>Release: pulse wave</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-white/24">
          <span>CHG {telemetry.charge}%</span>
          <span>LNK {telemetry.links}</span>
          <span>PLS {telemetry.pulses}</span>
        </div>
      </div>
    </>
  );
}
