"use client";

import { useEffect, useRef, useState } from "react";

type BodyKind = "sun" | "terran" | "ice" | "gas" | "blackHole" | "star";
type Tool = "terran" | "ice" | "gas" | "blackHole" | "star" | "orbit" | "delete" | "laser" | "nova" | "galaxy";

type Body = {
  id: number;
  kind: BodyKind;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  mass: number;
  hue: number;
  alive: boolean;
  ring?: boolean;
  fixed?: boolean;
  burn?: number;
  orbitCenterId?: number;
  orbitRadius?: number;
  orbitAngle?: number;
  orbitSpeed?: number;
  orbitYOffset?: number;
};

type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  hue: number;
};

type Camera = {
  yaw: number;
  pitch: number;
  zoom: number;
  distance: number;
  targetX: number;
  targetY: number;
  targetZ: number;
};

type ScreenPoint = {
  x: number;
  y: number;
  scale: number;
  depth: number;
};

const TOOL_LABELS: Record<Tool, string> = {
  terran: "Terran",
  ice: "Ice",
  gas: "Gas giant",
  blackHole: "Black hole",
  star: "Star",
  orbit: "Orbit",
  delete: "Delete",
  laser: "Laser",
  nova: "Nova bomb",
  galaxy: "Galaxy",
};

const PLANET_TOOLS: Tool[] = ["terran", "ice", "gas", "blackHole", "star"];
const ACTION_TOOLS: Tool[] = ["orbit", "delete", "laser", "nova", "galaxy"];
const GRAVITY = 0.085;

export default function SpaceLabPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const [ui, setUi] = useState({
    tool: "terran" as Tool,
    status: "Click to enter the universe",
    bodies: 0,
    galaxies: 1,
    selected: "none",
  });
  const stateRef = useRef({
    tool: "terran" as Tool,
    selectedId: null as number | null,
    draggingId: null as number | null,
    rotatingCamera: false,
    pointer: { x: 0, y: 0, worldX: 0, worldY: 0, worldZ: 0 },
    lastPointer: { x: 0, y: 0, t: 0 },
    camera: { yaw: -0.45, pitch: 0.48, zoom: 0.78, distance: 1000, targetX: 0, targetY: 0, targetZ: 0 } as Camera,
    bodies: [] as Body[],
    particles: [] as Particle[],
    nextId: 1,
    started: false,
    warp: 0,
    galaxyCount: 1,
    status: "Click to enter the universe",
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    let width = 0;
    let height = 0;
    let raf = 0;
    let frame = 0;
    const state = stateRef.current;
    const stars = Array.from({ length: 1200 }, (_, index) => ({
      x: seeded(index * 17 + 3) * 5200 - 2600,
      y: seeded(index * 29 + 11) * 5200 - 2600,
      z: seeded(index * 41 + 7) * 5200 - 2600,
      hue: index % 9 === 0 ? 260 : index % 5 === 0 ? 210 : 190,
      size: 0.5 + seeded(index * 13 + 5) * 1.8,
    }));

    const syncUi = () => {
      const selected = state.bodies.find((body) => body.id === state.selectedId);
      setUi({
        tool: state.tool,
        status: state.status,
        bodies: state.bodies.length,
        galaxies: state.galaxyCount,
        selected: selected ? `${selected.kind} #${selected.id}` : "none",
      });
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
    };

    const resetUniverse = () => {
      state.bodies = [];
      state.particles = [];
      state.nextId = 1;
      state.galaxyCount = 1;
      state.camera.targetX = 0;
      state.camera.targetY = 0;
      state.camera.targetZ = 0;
      addBody("sun", 0, 0, 0);
      const terran = state.bodies.find((body) => body.id === addBody("terran", 430, 0, 20));
      const ice = state.bodies.find((body) => body.id === addBody("ice", -620, 80, -120));
      const gas = state.bodies.find((body) => body.id === addBody("gas", 130, -720, 180));
      if (terran) createOrbit(terran);
      if (ice) createOrbit(ice);
      if (gas) createOrbit(gas);
      state.status = "Sun locked in the center. Drag it to unleash chaos.";
      syncUi();
    };

    const startAudio = () => {
      if (audioRef.current) return;
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      const audio = new AudioCtor();
      audioRef.current = audio;

      const master = audio.createGain();
      master.gain.value = 0.032;
      master.connect(audio.destination);

      const filter = audio.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 460;
      filter.Q.value = 8;
      filter.connect(master);

      [43.65, 65.41, 98, 130.81].forEach((freq, index) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = index % 2 === 0 ? "sine" : "triangle";
        osc.frequency.value = freq;
        gain.gain.value = 0.05 / (index + 1);
        osc.connect(gain);
        gain.connect(filter);
        osc.start();
      });

      const lfo = audio.createOscillator();
      const lfoGain = audio.createGain();
      lfo.type = "sine";
      lfo.frequency.value = 0.035;
      lfoGain.gain.value = 280;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
    };

    function enterUniverse() {
      if (state.started) return;
      state.started = true;
      state.warp = 1;
      state.status = "Universe online";
      startAudio();
      syncUi();
    }

    function addBody(
      kind: BodyKind,
      x: number,
      y: number,
      z: number,
      vx = 0,
      vy = 0,
      vz = 0,
    ) {
      const id = state.nextId;
      state.nextId += 1;
      const profile = getProfile(kind, id);
      state.bodies.push({
        id,
        kind,
        x,
        y,
        z,
        vx,
        vy,
        vz,
        radius: profile.radius,
        mass: profile.mass,
        hue: profile.hue,
        ring: profile.ring,
        fixed: kind === "sun" && id === 1,
        alive: true,
      });
      return id;
    }

    function spawnParticles(x: number, y: number, z: number, count: number, hue: number, power: number) {
      for (let i = 0; i < count; i += 1) {
        const a = seeded((state.nextId + i) * 91 + frame) * Math.PI * 2;
        const b = seeded((state.nextId + i) * 37 + frame) * Math.PI - Math.PI / 2;
        const speed = (0.8 + seeded((state.nextId + i) * 19) * 5) * power;
        state.particles.push({
          x,
          y,
          z,
          vx: Math.cos(a) * Math.cos(b) * speed,
          vy: Math.sin(a) * Math.cos(b) * speed,
          vz: Math.sin(b) * speed,
          life: 1,
          hue,
        });
      }
    }

    function project(x: number, y: number, z: number): ScreenPoint {
      const cam = state.camera;
      const localX = x - cam.targetX;
      const localY = y - cam.targetY;
      const localZ = z - cam.targetZ;
      const yawCos = Math.cos(cam.yaw);
      const yawSin = Math.sin(cam.yaw);
      const pitchCos = Math.cos(cam.pitch);
      const pitchSin = Math.sin(cam.pitch);

      const x1 = localX * yawCos - localZ * yawSin;
      const z1 = localX * yawSin + localZ * yawCos;
      const y1 = localY * pitchCos - z1 * pitchSin;
      const z2 = y * pitchSin + z1 * pitchCos;
      const perspective = cam.distance / (cam.distance + z2 + 1200);
      const scale = perspective * cam.zoom;

      return {
        x: width / 2 + x1 * scale,
        y: height / 2 + y1 * scale,
        scale,
        depth: z2,
      };
    }

    function screenToWorld(x: number, y: number) {
      const cam = state.camera;
      const scale = cam.zoom * (cam.distance / (cam.distance + 1200));
      const sx = (x - width / 2) / scale;
      const sy = (y - height / 2) / scale;
      const yawCos = Math.cos(-cam.yaw);
      const yawSin = Math.sin(-cam.yaw);
      const pitchCos = Math.cos(-cam.pitch);
      const pitchSin = Math.sin(-cam.pitch);

      const y1 = sy * pitchCos;
      const z1 = sy * pitchSin;
      return {
        x: sx * yawCos - z1 * yawSin + cam.targetX,
        y: y1 + cam.targetY,
        z: sx * yawSin + z1 * yawCos + cam.targetZ,
      };
    }

    function pickBody(x: number, y: number) {
      let best: { id: number; depth: number } | null = null;
      for (const body of state.bodies) {
        if (!body.alive) continue;
        const p = project(body.x, body.y, body.z);
        const hitRadius = Math.max(12, body.radius * p.scale + 12);
        if (Math.hypot(p.x - x, p.y - y) < hitRadius) {
          if (!best || p.depth > best.depth) best = { id: body.id, depth: p.depth };
        }
      }
      return best?.id ?? null;
    }

    function destroyBody(body: Body, intense = false) {
      body.alive = false;
      spawnParticles(body.x, body.y, body.z, intense ? 180 : 56, body.hue, intense ? 4.5 : 1.8);

      if (body.kind === "sun") {
        state.status = "Supernova. The system collapsed. Rebuilding...";
        for (const other of state.bodies) {
          if (other.id !== body.id) {
            const dx = other.x - body.x;
            const dy = other.y - body.y;
            const dz = other.z - body.z;
            const dist = Math.max(1, Math.hypot(dx, dy, dz));
            other.vx += (dx / dist) * 8;
            other.vy += (dy / dist) * 8;
            other.vz += (dz / dist) * 8;
            other.burn = 1;
          }
        }
        window.setTimeout(resetUniverse, 1600);
      }
    }

    function createOrbit(body: Body) {
      const sun = findNearestStar(body);
      if (!sun || body.id === sun.id) return;
      const dx = body.x - sun.x;
      const dy = body.y - sun.y;
      const dz = body.z - sun.z;
      const dist = Math.max(sun.radius * 3.2 + body.radius, Math.hypot(dx, dz));
      const currentTangential = ((body.vx * -dz) + (body.vz * dx)) / (dist || 1);
      const naturalSpeed = Math.sqrt((GRAVITY * sun.mass) / Math.max(260, dist));
      const speed = clamp(Math.abs(currentTangential) > 0.02 ? currentTangential : naturalSpeed, -1.65, 1.65);
      const horizontal = Math.hypot(dx, dz) || 1;
      body.orbitCenterId = sun.id;
      body.orbitRadius = dist;
      body.orbitAngle = Math.atan2(dz, dx);
      body.orbitSpeed = speed / Math.max(1, dist);
      body.orbitYOffset = clamp(dy, -180, 180);
      body.vx = (-dz / horizontal) * speed;
      body.vz = (dx / horizontal) * speed;
      body.vy = 0;
      body.fixed = false;
      state.status = `Orbit locked around ${sun.kind} #${sun.id}`;
      syncUi();
    }

    function fireLaser(target: Body) {
      spawnParticles(target.x, target.y, target.z, 80, 4, 2.8);
      target.burn = 1;
      target.mass *= 0.75;
      target.radius *= 0.86;
      if (target.radius < 9 || target.kind === "sun") destroyBody(target, target.kind === "sun");
      state.status = target.kind === "sun" ? "You fired at the sun" : "Planet fractured";
      syncUi();
    }

    function findNearestStar(body: Body) {
      let nearest: Body | undefined;
      let nearestDistance = Infinity;

      for (const candidate of state.bodies) {
        if (!candidate.alive || candidate.id === body.id) continue;
        if (candidate.kind !== "sun" && candidate.kind !== "star") continue;
        const distance = Math.hypot(body.x - candidate.x, body.y - candidate.y, body.z - candidate.z);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = candidate;
        }
      }

      return nearest;
    }

    function updateStableOrbit(body: Body) {
      if (!body.orbitCenterId || body.id === state.draggingId) return false;

      const center = state.bodies.find((item) => item.id === body.orbitCenterId && item.alive);
      if (!center) {
        body.orbitCenterId = undefined;
        return false;
      }

      const radius = body.orbitRadius ?? Math.max(260, Math.hypot(body.x - center.x, body.z - center.z));
      const angle = (body.orbitAngle ?? Math.atan2(body.z - center.z, body.x - center.x)) + (body.orbitSpeed ?? 0.001);
      const yOffset = body.orbitYOffset ?? body.y - center.y;
      const nextX = center.x + Math.cos(angle) * radius;
      const nextZ = center.z + Math.sin(angle) * radius;
      const nextY = center.y + yOffset + Math.sin(angle * 0.7) * 12;

      body.vx = nextX - body.x;
      body.vy = nextY - body.y;
      body.vz = nextZ - body.z;
      body.x = nextX;
      body.y = nextY;
      body.z = nextZ;
      body.orbitAngle = angle;
      body.orbitRadius = radius;
      body.orbitYOffset = yOffset;

      return true;
    }

    function addGalaxy(centerX: number, centerY: number, centerZ: number) {
      const galaxyId = state.galaxyCount + 1;
      state.galaxyCount = galaxyId;
      const sunId = addBody("sun", centerX, centerY, centerZ);
      const sun = state.bodies.find((item) => item.id === sunId);
      if (sun) sun.fixed = false;

      for (let i = 0; i < 9; i += 1) {
        const angle = (Math.PI * 2 * i) / 9;
        const radius = 160 + i * 42;
        const kind: BodyKind = i % 4 === 0 ? "gas" : i % 3 === 0 ? "ice" : "terran";
        const id = addBody(
          kind,
          centerX + Math.cos(angle) * radius,
          centerY + (i % 2 === 0 ? 24 : -24),
          centerZ + Math.sin(angle) * radius,
        );
        const body = state.bodies.find((item) => item.id === id);
        if (body && sun) createOrbit(body);
      }
      state.status = `Galaxy ${galaxyId} created`;
      syncUi();
    }

    function handleWorldAction(x: number, y: number) {
      const world = screenToWorld(x, y);
      const pickedId = pickBody(x, y);
      const picked = state.bodies.find((body) => body.id === pickedId);

      if (state.tool === "delete") {
        if (picked) destroyBody(picked, picked.kind === "sun");
        return;
      }

      if (state.tool === "laser") {
        if (picked) fireLaser(picked);
        return;
      }

      if (state.tool === "nova") {
        if (picked) destroyBody(picked, true);
        else spawnParticles(world.x, world.y, world.z, 120, 220, 3);
        return;
      }

      if (state.tool === "orbit") {
        if (picked) createOrbit(picked);
        return;
      }

      if (state.tool === "galaxy") {
        addGalaxy(world.x, world.y, world.z);
        return;
      }

      const kind = state.tool as BodyKind;
      const id = addBody(kind, world.x, world.y, world.z);
      const body = state.bodies.find((item) => item.id === id);
      if (body && kind !== "blackHole" && kind !== "star") createOrbit(body);
      state.status = `${TOOL_LABELS[state.tool]} created`;
      syncUi();
    }

    const onPointerDown = (event: PointerEvent) => {
      enterUniverse();
      state.lastPointer = { x: event.clientX, y: event.clientY, t: performance.now() };

      if (event.button === 1 || event.shiftKey) {
        state.rotatingCamera = true;
        return;
      }

      const pickedId = pickBody(event.clientX, event.clientY);
      const picked = state.bodies.find((body) => body.id === pickedId);

      if (picked && PLANET_TOOLS.includes(state.tool)) {
        state.draggingId = picked.id;
        state.selectedId = picked.id;
        picked.fixed = false;
        picked.orbitCenterId = undefined;
        picked.orbitRadius = undefined;
        picked.orbitAngle = undefined;
        picked.orbitSpeed = undefined;
        syncUi();
        return;
      }

      handleWorldAction(event.clientX, event.clientY);
    };

    const onPointerMove = (event: PointerEvent) => {
      const world = screenToWorld(event.clientX, event.clientY);
      state.pointer = { x: event.clientX, y: event.clientY, worldX: world.x, worldY: world.y, worldZ: world.z };

      if (state.rotatingCamera) {
        const dx = event.clientX - state.lastPointer.x;
        const dy = event.clientY - state.lastPointer.y;
        state.camera.yaw += dx * 0.006;
        state.camera.pitch = clamp(state.camera.pitch + dy * 0.004, -1.15, 1.15);
        state.lastPointer = { x: event.clientX, y: event.clientY, t: performance.now() };
        return;
      }

      if (state.draggingId !== null) {
        const body = state.bodies.find((item) => item.id === state.draggingId);
        if (!body) return;
        const now = performance.now();
        const dt = Math.max(16, now - state.lastPointer.t);
        body.vx = ((world.x - body.x) / dt) * 12;
        body.vy = ((world.y - body.y) / dt) * 12;
        body.vz = ((world.z - body.z) / dt) * 12;
        body.x = world.x;
        body.y = world.y;
        body.z = world.z;
        state.lastPointer = { x: event.clientX, y: event.clientY, t: now };
      }
    };

    const onPointerUp = () => {
      if (state.draggingId !== null) {
        const body = state.bodies.find((item) => item.id === state.draggingId);
        if (body && body.kind !== "sun" && body.kind !== "blackHole") createOrbit(body);
      }
      state.draggingId = null;
      state.rotatingCamera = false;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const before = screenToWorld(event.clientX, event.clientY);
      state.camera.zoom = clamp(state.camera.zoom * (event.deltaY > 0 ? 0.88 : 1.12), 0.08, 2.8);
      state.camera.distance = 600 + (1 / state.camera.zoom) * 900;
      const after = screenToWorld(event.clientX, event.clientY);
      state.camera.targetX += before.x - after.x;
      state.camera.targetY += before.y - after.y;
      state.camera.targetZ += before.z - after.z;
    };

    const onContextMenu = (event: MouseEvent) => event.preventDefault();

    function stepPhysics() {
      for (const body of state.bodies) {
        if (!body.alive || body.fixed || body.id === state.draggingId) continue;
        const isStableOrbit = updateStableOrbit(body);
        if (isStableOrbit) {
          if (body.burn) body.burn *= 0.985;
          continue;
        }

        for (const other of state.bodies) {
          if (body.id === other.id || !other.alive) continue;
          const dx = other.x - body.x;
          const dy = other.y - body.y;
          const dz = other.z - body.z;
          const distSq = Math.max(8200, dx * dx + dy * dy + dz * dz);
          const dist = Math.sqrt(distSq);
          const gravityMultiplier = other.kind === "blackHole" ? 3.2 : other.kind === "sun" ? 1 : other.kind === "star" ? 0.45 : 0.22;
          const force = (GRAVITY * other.mass * gravityMultiplier) / distSq;

          body.vx += (dx / dist) * force;
          body.vy += (dy / dist) * force;
          body.vz += (dz / dist) * force;

          if (other.kind === "blackHole" && body.kind !== "blackHole" && dist < other.radius * 2.2 + body.radius) {
            destroyBody(body, false);
            other.mass += body.mass * 0.18;
            other.radius = Math.min(80, other.radius + body.radius * 0.04);
          }

          if ((other.kind === "sun" || other.kind === "star") && body.kind !== "sun" && dist < other.radius * 2.2 + body.radius) {
            body.burn = Math.min(1, (body.burn ?? 0) + 0.025);
            body.radius *= 0.997;
            if (body.radius < 10) destroyBody(body, false);
          }
        }

        body.x += body.vx;
        body.y += body.vy;
        body.z += body.vz;
        body.vx *= 0.9996;
        body.vy *= 0.9996;
        body.vz *= 0.9996;
        if (body.burn) body.burn *= 0.985;
      }

      handleCollisions();
      state.bodies = state.bodies.filter((body) => body.alive);

      for (const particle of state.particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.vz *= 0.985;
        particle.life *= 0.965;
      }
      state.particles = state.particles.filter((particle) => particle.life > 0.02);
    }

    function handleCollisions() {
      for (let i = 0; i < state.bodies.length; i += 1) {
        const a = state.bodies[i]!;
        if (!a.alive || a.kind === "blackHole") continue;

        for (let j = i + 1; j < state.bodies.length; j += 1) {
          const b = state.bodies[j]!;
          if (!b.alive || b.kind === "blackHole") continue;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dz = b.z - a.z;
          const dist = Math.hypot(dx, dy, dz);
          const collisionDistance = (a.radius + b.radius) * 0.78;

          if (dist > collisionDistance) continue;

          const relativeVelocity = Math.hypot(a.vx - b.vx, a.vy - b.vy, a.vz - b.vz);
          const isSolarCollision = a.kind === "sun" || b.kind === "sun";
          const isHardImpact = relativeVelocity > 0.22 || isSolarCollision;

          if (isHardImpact) {
            destroyBody(a, isSolarCollision);
            destroyBody(b, isSolarCollision);
            state.status = isSolarCollision ? "Solar collision. System destabilized." : "Planetary collision detected";
            syncUi();
          } else {
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);
            const nz = dz / (dist || 1);
            a.vx -= nx * 0.08;
            a.vy -= ny * 0.08;
            a.vz -= nz * 0.08;
            b.vx += nx * 0.08;
            b.vy += ny * 0.08;
            b.vz += nz * 0.08;
          }
        }
      }
    }

    function drawBackground() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      const nebula = ctx.createRadialGradient(width * 0.52, height * 0.46, 0, width * 0.52, height * 0.46, Math.max(width, height) * 0.74);
      nebula.addColorStop(0, "rgba(26, 37, 110, 0.34)");
      nebula.addColorStop(0.42, "rgba(10, 10, 45, 0.16)");
      nebula.addColorStop(1, "rgba(0,0,0,1)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);
    }

    function drawStars() {
      for (const star of stars) {
        const p = project(star.x, star.y, star.z);
        if (p.x < -80 || p.x > width + 80 || p.y < -80 || p.y > height + 80) continue;
        const alpha = clamp(0.18 + p.scale * 0.95, 0.08, 0.9);
        const size = star.size * clamp(p.scale * 1.8, 0.3, 2.8);
        ctx.fillStyle = `hsla(${star.hue}, 100%, 82%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (state.started && state.warp > 0.02) {
          ctx.strokeStyle = `hsla(${star.hue}, 100%, 82%, ${alpha * state.warp * 0.8})`;
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + (p.x - width / 2) * state.warp * 0.1, p.y + (p.y - height / 2) * state.warp * 0.1);
          ctx.stroke();
        }
      }
    }

    function drawOrbitGuides() {
      const sun = state.bodies.find((body) => body.kind === "sun" && body.alive);
      if (!sun) return;
      const sunPoint = project(sun.x, sun.y, sun.z);

      for (const body of state.bodies) {
        if (body.id === sun.id || body.kind === "blackHole" || !body.alive) continue;
        const dist = Math.hypot(body.x - sun.x, body.y - sun.y, body.z - sun.z);
        if (dist < 80 || dist > 1600) continue;
        ctx.strokeStyle = "rgba(130,170,255,0.11)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(sunPoint.x, sunPoint.y, dist * sunPoint.scale, dist * sunPoint.scale * 0.36, state.camera.yaw, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function drawBody(body: Body) {
      const p = project(body.x, body.y, body.z);
      if (p.x < -200 || p.x > width + 200 || p.y < -200 || p.y > height + 200) return;
      const radius = Math.max(body.kind === "star" ? 4 : 8, body.radius * p.scale);

      ctx.save();
      ctx.translate(p.x, p.y);

      if (body.kind === "blackHole") {
        const grad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 4);
        grad.addColorStop(0, "rgba(0,0,0,1)");
        grad.addColorStop(0.34, "rgba(0,0,0,1)");
        grad.addColorStop(0.5, "rgba(124,58,237,0.75)");
        grad.addColorStop(1, "rgba(37,99,235,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(220,205,255,0.5)";
        ctx.lineWidth = 1.4;
        ctx.rotate(frame * 0.012);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 2.8, radius * 0.72, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      if (body.kind === "sun") {
        const pulse = 1 + Math.sin(frame * 0.04) * 0.08;
        const halo = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 5.5 * pulse);
        halo.addColorStop(0, "rgba(255,245,190,0.95)");
        halo.addColorStop(0.2, "rgba(255,150,55,0.7)");
        halo.addColorStop(0.55, "rgba(255,80,30,0.22)");
        halo.addColorStop(1, "rgba(255,80,30,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 5.5 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      if (body.ring) {
        ctx.strokeStyle = `hsla(${body.hue}, 100%, 78%, 0.28)`;
        ctx.lineWidth = Math.max(1, p.scale * 2);
        ctx.rotate(-0.28);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.85, radius * 0.48, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.rotate(0.28);
      }

      const burn = body.burn ?? 0;
      const grad = ctx.createRadialGradient(-radius * 0.42, -radius * 0.5, 0, 0, 0, radius * 1.25);
      grad.addColorStop(0, burn > 0.15 ? "rgba(255,210,140,1)" : `hsla(${body.hue}, 100%, 78%, 1)`);
      grad.addColorStop(0.48, burn > 0.15 ? "rgba(255,80,35,0.9)" : `hsla(${body.hue}, 86%, 48%, 0.86)`);
      grad.addColorStop(1, "rgba(0,0,0,0.95)");
      ctx.shadowColor = burn > 0.15 ? "rgba(255,90,40,0.6)" : `hsla(${body.hue}, 100%, 60%, 0.45)`;
      ctx.shadowBlur = radius * (body.kind === "sun" ? 2.2 : 1.1);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (state.selectedId === body.id) {
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawParticles() {
      ctx.globalCompositeOperation = "screen";
      for (const particle of state.particles) {
        const p = project(particle.x, particle.y, particle.z);
        const size = Math.max(1, 3.4 * p.scale * particle.life);
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 72%, ${particle.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function draw() {
      frame += 1;
      drawBackground();
      drawStars();
      drawOrbitGuides();
      stepPhysics();

      const sortedBodies = [...state.bodies].sort((a, b) => project(a.x, a.y, a.z).depth - project(b.x, b.y, b.z).depth);
      for (const body of sortedBodies) drawBody(body);
      drawParticles();

      if (state.started) state.warp *= 0.982;

      const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.72);
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0,0,0,0.82)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      raf = requestAnimationFrame(draw);
    }

    resize();
    resetUniverse();
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("contextmenu", onContextMenu);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("contextmenu", onContextMenu);
      audioRef.current?.close();
      audioRef.current = null;
    };
  }, []);

  const selectTool = (tool: Tool) => {
    stateRef.current.tool = tool;
    stateRef.current.status = `${TOOL_LABELS[tool]} selected`;
    setUi((current) => ({
      ...current,
      tool,
      status: `${TOOL_LABELS[tool]} selected`,
    }));
  };

  return (
    <main className="fixed inset-0 z-[100] overflow-hidden bg-black text-white">
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" />

      <div className="pointer-events-none absolute left-4 top-4 max-w-sm select-none rounded-3xl border border-white/[0.08] bg-black/28 p-4 text-[10px] uppercase tracking-[0.18em] text-white/36 backdrop-blur-xl">
        <p className="mb-2 text-white/66">Space Lab</p>
        <p>Drag bodies. Shift-drag empty space rotates camera.</p>
        <p>Mouse wheel zooms toward the cursor position.</p>
      </div>

      <div className="absolute bottom-4 left-1/2 w-[min(980px,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl border border-white/[0.08] bg-black/36 p-4 backdrop-blur-2xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/28">Create body</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLANET_TOOLS.map((tool) => (
                <ToolButton key={tool} active={ui.tool === tool} onClick={() => selectTool(tool)}>
                  {TOOL_LABELS[tool]}
                </ToolButton>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/28">Actions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACTION_TOOLS.map((tool) => (
                <ToolButton key={tool} active={ui.tool === tool} onClick={() => selectTool(tool)}>
                  {TOOL_LABELS[tool]}
                </ToolButton>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-2 border-t border-white/[0.06] pt-3 text-xs text-white/42 md:grid-cols-4">
          <span>Status: {ui.status}</span>
          <span>Bodies: {ui.bodies}</span>
          <span>Galaxies: {ui.galaxies}</span>
          <span>Selected: {ui.selected}</span>
        </div>
      </div>
    </main>
  );
}

function ToolButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto border px-3 py-2 text-xs transition-colors ${
        active
          ? "border-blue-200/42 bg-blue-400/16 text-white"
          : "border-white/[0.09] bg-white/[0.025] text-white/42 hover:border-white/24 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function getProfile(kind: BodyKind, id: number) {
  switch (kind) {
    case "sun":
      return { radius: 78, mass: 2400, hue: 42, ring: false };
    case "terran":
      return { radius: 36 + (id % 3) * 4, mass: 54, hue: 198, ring: id % 2 === 0 };
    case "ice":
      return { radius: 32 + (id % 4) * 3, mass: 42, hue: 218, ring: false };
    case "gas":
      return { radius: 62 + (id % 4) * 6, mass: 118, hue: 274, ring: true };
    case "blackHole":
      return { radius: 38, mass: 1800, hue: 285, ring: true };
    case "star":
      return { radius: 24, mass: 260, hue: 56, ring: false };
  }
}

function seeded(value: number) {
  const result = Math.sin(value * 12.9898) * 43758.5453;
  return result - Math.floor(result);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
