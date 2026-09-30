"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PETS } from "@/data/pets/catalog";
import type { OwnedPet } from "@/lib/pets/save";
import { usePetSave } from "@/lib/pets/pet-save-provider";
import { awardArenaWin } from "@/lib/pets/progression";
import { useHomeMotionPreferences } from "@/components/home/home-motion";
import {
  createExpedition,
  EMPTY_INPUT,
  restoreRun,
  RUN_KEY,
  serializeRun,
  stepExpedition,
  upgrade,
  type Expedition,
  type Input,
} from "@/lib/pets/expedition/engine";
import { ExpeditionRenderer } from "./expedition-renderer";
import "./expedition.css";

export function PetArena({ pet, vi }: { pet: OwnedPet; vi: boolean }) {
  const { update } = usePetSave(),
    { prefersReducedMotion } = useHomeMotionPreferences();
  const l = (en: string, vn: string) => (vi ? vn : en);
  const root = useRef<HTMLDialogElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    viewport = useRef<HTMLDivElement>(null);
  const game = useRef(createExpedition(pet.species, pet.stage)),
    keys = useRef(new Set<string>()),
    touch = useRef({ x: 0, y: 0 });
  const expandedRef = useRef(false),
    automaticPause = useRef(false);
  const paused = useRef(true),
    updateRef = useRef(update),
    claimed = useRef(false),
    sound = useRef<AudioContext | null>(null),
    soundOn = useRef(false);
  const [hud, setHud] = useState<Expedition>(() =>
      createExpedition(pet.species, pet.stage),
    ),
    [isPaused, setPaused] = useState(true),
    [expanded, setExpanded] = useState(false),
    [muted, setMuted] = useState(true),
    [storageError, setStorageError] = useState(false);
  const upgradePanel = useRef<HTMLDivElement>(null);
  const [stick, setStick] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (hud.choice)
      upgradePanel.current
        ?.querySelector("button")
        ?.focus({ preventScroll: true });
  }, [hud.choice]);
  const storageKey = `${RUN_KEY}:${pet.id}`;
  useEffect(() => {
    updateRef.current = update;
  }, [update]);
  function persist() {
    try {
      if (game.current.status !== "ready")
        localStorage.setItem(storageKey, serializeRun(game.current));
    } catch {
      setStorageError(true);
    }
  }
  function clearInput() {
    keys.current.clear();
    touch.current = { x: 0, y: 0 };
    setStick({ x: 0, y: 0 });
  }
  function pause(value: boolean, automatic = false) {
    automaticPause.current = automatic;
    paused.current = value;
    setPaused(value);
    clearInput();
    if (value) persist();
    else canvas.current?.focus({ preventScroll: true });
  }
  function start() {
    game.current = {
      ...createExpedition(pet.species, pet.stage, crypto.randomUUID()),
      status: "running",
    };
    claimed.current = false;
    pause(false);
    setHud(game.current);
    persist();
  }
  function tone(frequency: number, volume: number, length = 0.08) {
    const a = sound.current;
    if (!a || !soundOn.current || a.state !== "running") return;
    const oscillator = a.createOscillator(),
      gain = a.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, a.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 0.55,
      a.currentTime + length,
    );
    gain.gain.setValueAtTime(volume, a.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + length);
    oscillator.connect(gain);
    gain.connect(a.destination);
    oscillator.start();
    oscillator.stop(a.currentTime + length);
  }
  async function toggleSound() {
    try {
      if (!sound.current) sound.current = new AudioContext();
      await sound.current.resume();
      soundOn.current = !soundOn.current;
      setMuted(!soundOn.current);
    } catch {
      setMuted(true);
      soundOn.current = false;
    }
  }
  useEffect(() => {
    return () => {
      void sound.current?.close();
    };
  }, []);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (!expanded) {
      if (!node.open) node.setAttribute("open", "");
      return;
    }
    node.close();
    node.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    canvas.current?.focus({ preventScroll: true });
    return () => {
      node.close();
      node.setAttribute("open", "");
      document.body.style.overflow = old;
    };
  }, [expanded]);
  useEffect(() => {
    const node = canvas.current,
      container = viewport.current;
    if (!node || !container) return;
    const c = node.getContext("2d");
    if (!c) return;
    let restored: Expedition | null = null;
    try {
      restored = restoreRun(
        localStorage.getItem(storageKey),
        pet.species,
        pet.stage,
      );
    } catch {
      /* private browsing keeps the current visit playable */
    }
    const live = restoreRun(serializeRun(game.current), pet.species, pet.stage);
    game.current = live ?? restored ?? createExpedition(pet.species, pet.stage);
    paused.current = true;
    const initialFrame = requestAnimationFrame(() => {
      setPaused(true);
      setHud(game.current);
    });
    const heldKeys = keys.current;
    const renderer = new ExpeditionRenderer(game.current);
    let frame = 0,
      previous = 0,
      accumulator = 0,
      lastHud = 0,
      lastSave = 0,
      inView = false,
      width = 900,
      height = 620,
      pixelRatio = 1;
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      pixelRatio = Math.min(2, devicePixelRatio || 1);
      node.width = Math.round(width * pixelRatio);
      node.height = Math.round(height * pixelRatio);
    });
    resize.observe(container);
    function loop(time: number) {
      const dt = previous ? Math.min(0.08, (time - previous) / 1000) : 1 / 60;
      previous = time;
      if (
        !paused.current &&
        game.current.status === "running" &&
        !game.current.choice
      ) {
        const k = keys.current,
          input: Input = {
            ...EMPTY_INPUT,
            x:
              touch.current.x ||
              Number(k.has("d") || k.has("ArrowRight")) -
                Number(k.has("a") || k.has("ArrowLeft")),
            y:
              touch.current.y ||
              Number(k.has("s") || k.has("ArrowDown")) -
                Number(k.has("w") || k.has("ArrowUp")),
            attack: k.has(" ") || k.has("j"),
            dash: k.has("Shift") || k.has("k"),
            burst: k.has("e") || k.has("l"),
          };
        accumulator += dt;
        const old = game.current;
        while (accumulator >= 1 / 60) {
          game.current = stepExpedition(game.current, input, 1 / 60);
          accumulator -= 1 / 60;
        }
        if (game.current.player.combo !== old.player.combo)
          tone(260 + game.current.player.combo * 70, 0.035);
        if (game.current.kills > old.kills) tone(720, 0.045, 0.18);
        if (game.current.player.hp < old.player.hp) tone(110, 0.06, 0.16);
      } else accumulator = 0;
      if (game.current.status === "won" && !claimed.current) {
        claimed.current = true;
        const completedRun = game.current.run;
        void updateRef.current((s) => awardArenaWin(s, pet.id, completedRun));
        persist();
      }
      c!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      renderer.draw(
        c!,
        game.current,
        width,
        height,
        prefersReducedMotion,
        vi,
        dt,
      );
      if (time - lastHud > 100) {
        setHud(game.current);
        lastHud = time;
      }
      if (time - lastSave > 2500) {
        persist();
        lastSave = time;
      }
      if (inView && !document.hidden) frame = requestAnimationFrame(loop);
    }
    function visibility() {
      cancelAnimationFrame(frame);
      previous = 0;
      if (document.hidden) pause(true);
      else if (inView) frame = requestAnimationFrame(loop);
    }
    function blur() {
      pause(true);
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = expandedRef.current || entry.isIntersecting;
      cancelAnimationFrame(frame);
      previous = 0;
      if (!inView) pause(true, true);
      else if (!document.hidden) frame = requestAnimationFrame(loop);
    });
    observer.observe(container);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", blur);
    return () => {
      persist();
      cancelAnimationFrame(initialFrame);
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      heldKeys.clear();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", blur);
    };
    // Input and persistence use refs so a HUD render never restarts the simulation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet.id, pet.species, pet.stage, prefersReducedMotion, vi]);
  function choose(pick: "power" | "haste" | "vitality") {
    game.current = upgrade(game.current, pick);
    setHud(game.current);
    clearInput();
    persist();
    canvas.current?.focus({ preventScroll: true });
  }
  function action(key: string, label: string, glyph: string, cooldown: number) {
    return (
      <button
        type="button"
        className={`wild-action ${cooldown > 0 ? "cooling" : ""}`}
        aria-label={label}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          keys.current.add(key);
        }}
        onPointerUp={() => keys.current.delete(key)}
        onPointerCancel={() => keys.current.delete(key)}
        onLostPointerCapture={() => keys.current.delete(key)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            keys.current.add(key);
          }
        }}
        onKeyUp={() => keys.current.delete(key)}
      >
        <b>{cooldown > 0 ? cooldown.toFixed(1) : glyph}</b>
        <small>{label}</small>
      </button>
    );
  }
  const ready = hud.status === "ready",
    terminal = hud.status === "won" || hud.status === "lost",
    overlay = ready || terminal || isPaused;
  const messages = {
    start: l(
      "Follow the path. Awaken the three shrines.",
      "Theo đường mòn. Đánh thức ba ngôi đền.",
    ),
    shrine: l(
      "A shrine remembers its light.",
      "Một ngôi đền đã tìm lại ánh sáng.",
    ),
    boss: l(
      "The Hollow Warden has awakened. Follow the compass.",
      "Hộ Vệ Rỗng đã thức giấc. Đi theo la bàn.",
    ),
    upgrade: l(
      "A little stronger. A little braver.",
      "Mạnh hơn một chút. Can đảm hơn một chút.",
    ),
    win: l("The forest is breathing again.", "Khu rừng lại được hồi sinh."),
    none: "",
  };
  return (
    <dialog
      open
      ref={root}
      onCancel={(e) => e.preventDefault()}
      aria-label={l("Wildwood expedition", "Thám hiểm Wildwood")}
      className={`wildwood ${expanded ? "is-expanded" : ""}`}
      onKeyDown={(e) => {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (
          e.target === canvas.current &&
          [
            "w",
            "a",
            "s",
            "d",
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            " ",
            "Shift",
            "e",
            "j",
            "k",
            "l",
          ].includes(key)
        ) {
          e.preventDefault();
          keys.current.add(key);
        }
        if (e.key === "Escape" && !ready && !terminal) {
          e.preventDefault();
          pause(!paused.current);
        }
      }}
      onKeyUp={(e) =>
        keys.current.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key)
      }
    >
      <div className="wild-topline">
        <div>
          <span className="wild-dot" /> WILDWOOD <small>EXPEDITION / 01</small>
        </div>
        <div>
          <button onClick={toggleSound} aria-pressed={!muted}>
            {muted ? l("Sound off", "Tắt âm") : l("Sound on", "Bật âm")}
          </button>
          <button
            onClick={() => {
              if (expanded) pause(true);
              else if (
                automaticPause.current &&
                game.current.status === "running"
              )
                pause(false);
              expandedRef.current = !expanded;
              setExpanded(!expanded);
            }}
            aria-label={
              expanded
                ? l("Exit expanded view", "Thu nhỏ")
                : l("Expand game", "Mở rộng game")
            }
          >
            {expanded ? "↙" : "⛶"}
          </button>
          {!ready && !terminal && (
            <button
              onClick={() => pause(!paused.current)}
              aria-label={l("Pause expedition", "Tạm dừng")}
            >
              {isPaused ? "▶" : "Ⅱ"}
            </button>
          )}
        </div>
      </div>
      <div className="wild-viewport" ref={viewport}>
        <canvas
          ref={canvas}
          tabIndex={0}
          aria-label={l(
            "Wildwood expedition. WASD to move, Space to strike, Shift to dash, E for moonburst.",
            "Thám hiểm Wildwood. WASD di chuyển, Space đánh, Shift lướt, E nguyệt bộc.",
          )}
          data-status={hud.status}
          data-x={Math.round(hud.player.x)}
          data-y={Math.round(hud.player.y)}
          data-kills={hud.kills}
          onPointerDown={() => canvas.current?.focus({ preventScroll: true })}
        />
        {!ready && (
          <div className="wild-hud">
            <div className="wild-vitals">
              <span>
                {PETS[pet.species].name} <b>LV {hud.level}</b>
              </span>
              <progress
                aria-label={l("Health", "Máu")}
                value={hud.player.hp}
                max={hud.player.maxHp}
              />
              <small>
                ♡ {hud.player.hp} / {hud.player.maxHp}
                <i>
                  {hud.kills} {l("defeated", "đã hạ")}
                </i>
              </small>
              <progress
                className="wild-xp"
                aria-label={l("Experience", "Kinh nghiệm")}
                value={hud.xp}
                max={hud.level * 9}
              />
            </div>
            <div className="wild-objective">
              <span>{l("RESTORE THE FOREST", "HỒI SINH KHU RỪNG")}</span>
              <strong>
                {hud.shrines.filter(Boolean).length} / 3{" "}
                <small>{l("shrines", "ngôi đền")}</small>
              </strong>
              <div>
                {hud.shrines.map((lit, i) => (
                  <i key={i} className={lit ? "lit" : ""}>
                    ◇
                  </i>
                ))}
              </div>
            </div>
          </div>
        )}
        {!overlay && hud.messageTime > 0 && (
          <div className="wild-announcement" role="status">
            {messages[hud.message]}
          </div>
        )}
        {overlay && (
          <div className={`wild-overlay ${ready ? "wild-title" : ""}`}>
            {ready && (
              <Image
                src="/pets/wildwood/cover.png"
                alt=""
                fill
                sizes="(max-width: 700px) 100vw, 1400px"
                quality={90}
                className="wild-cover"
              />
            )}
            <div className="wild-title-copy">
              <span className="wild-kicker">
                {ready
                  ? "A POCKET WORLD ADVENTURE"
                  : hud.status === "won"
                    ? "EXPEDITION COMPLETE"
                    : hud.status === "lost"
                      ? "THE FOREST WILL WAIT"
                      : "TAKE A BREATH"}
              </span>
              <h3>
                {ready ? (
                  <>
                    Wild<em>wood.</em>
                  </>
                ) : hud.status === "won" ? (
                  l("Light returns.", "Ánh sáng trở về.")
                ) : hud.status === "lost" ? (
                  l("Rest. Rise again.", "Nghỉ chút. Đi tiếp.")
                ) : (
                  l("Your journey awaits.", "Hành trình còn đó.")
                )}
              </h3>
              <p>
                {ready
                  ? l(
                      "Beyond the garden, an ancient forest has forgotten its light. Take your companion. Find the three shrines. Face what waits beneath the roots.",
                      "Bên kia khu vườn, một khu rừng cổ đã quên mất ánh sáng. Mang theo pet, tìm ba ngôi đền và đối mặt thứ đang chờ dưới những rễ cây.",
                    )
                  : hud.status === "won"
                    ? l(
                        "Three shrines awakened. One forest saved. +90 coins · +12 gems · +25 XP.",
                        "Ba đền thức tỉnh. Khu rừng hồi sinh. +90 xu · +12 ngọc · +25 XP.",
                      )
                    : hud.status === "lost"
                      ? l(
                          "Read the warning circles. Dash through danger. Your next expedition starts with a fresh trail.",
                          "Chú ý vùng cảnh báo. Lướt qua hiểm nguy. Chuyến thám hiểm mới đang chờ bạn.",
                        )
                      : l(
                          "Your expedition is saved in this browser. Pick up where you left off.",
                          "Hành trình được lưu trên trình duyệt này. Tiếp tục từ nơi bạn dừng lại.",
                        )}
              </p>
              <button
                className="wild-enter"
                onClick={ready || terminal ? start : () => pause(false)}
              >
                {ready
                  ? l("Begin expedition", "Bắt đầu thám hiểm")
                  : terminal
                    ? l("New expedition", "Thám hiểm lần nữa")
                    : l("Continue expedition", "Tiếp tục thám hiểm")}{" "}
                <span>↗</span>
              </button>
              {ready && (
                <div className="wild-chapters">
                  <span>01 / {l("Explore", "Khám phá")}</span>
                  <span>02 / {l("Awaken", "Thức tỉnh")}</span>
                  <span>03 / {l("Confront", "Đối mặt")}</span>
                </div>
              )}
            </div>
          </div>
        )}
        {!overlay && hud.choice && (
          <div
            ref={upgradePanel}
            className="wild-upgrade"
            role="dialog"
            aria-label={l("Choose an upgrade", "Chọn nâng cấp")}
          >
            <span className="wild-kicker">LEVEL {hud.level}</span>
            <h3>{l("What will you become?", "Bạn sẽ trở thành ai?")}</h3>
            <p>
              {l(
                "Choose a gift. The forest waits while you decide.",
                "Chọn một món quà. Khu rừng đợi bạn quyết định.",
              )}
            </p>
            <div>
              {(["power", "haste", "vitality"] as const).map((pick, i) => (
                <button key={pick} onClick={() => choose(pick)}>
                  <b>{["✧", "↯", "♡"][i]}</b>
                  <strong>
                    {
                      [
                        l("Moonfang", "Nanh Trăng"),
                        l("Windstep", "Bước Gió"),
                        l("Wildheart", "Tim Rừng"),
                      ][i]
                    }
                  </strong>
                  <small>
                    {
                      [
                        l(
                          "Stronger strikes & moonburst",
                          "Tăng sát thương đánh và kỹ năng",
                        ),
                        l(
                          "Faster attacks, dash & collection",
                          "Đánh, lướt và hút vật phẩm nhanh hơn",
                        ),
                        l(
                          "+3 max health · Heal 5",
                          "+3 máu tối đa · Hồi 5 máu",
                        ),
                      ][i]
                    }
                  </small>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="wild-controls">
        <div className="wild-controls-copy">
          <strong>{l("Follow the light.", "Đi theo ánh sáng.")}</strong>
          <p>
            <kbd>WASD</kbd> {l("move", "đi")} <kbd>SPACE</kbd>{" "}
            {l("strike", "đánh")} <kbd>SHIFT</kbd> {l("dash", "lướt")}{" "}
            <kbd>E</kbd> {l("moonburst", "kỹ năng")}
          </p>
          <small>
            {storageError
              ? l(
                  "Storage unavailable — this visit only.",
                  "Không lưu được — chỉ trong lần ghé này.",
                )
              : l(
                  "Autosaved locally · Defeat the guardians, then approach each shrine.",
                  "Tự lưu trên máy · Hạ vệ binh, rồi đến gần từng ngôi đền.",
                )}
          </small>
        </div>
        <div
          className="wild-touch"
          aria-label={l("Touch controls", "Điều khiển cảm ứng")}
        >
          <button
            className="wild-stick"
            aria-label={l("Movement joystick", "Cần di chuyển")}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
              const r = e.currentTarget.getBoundingClientRect(),
                dx = e.clientX - r.left - r.width / 2,
                dy = e.clientY - r.top - r.height / 2,
                norm = Math.max(30, Math.hypot(dx, dy));
              touch.current = { x: dx / norm, y: dy / norm };
              setStick({ x: (dx / norm) * 23, y: (dy / norm) * 23 });
            }}
            onPointerUp={() => {
              touch.current = { x: 0, y: 0 };
              setStick({ x: 0, y: 0 });
            }}
            onPointerCancel={() => {
              touch.current = { x: 0, y: 0 };
              setStick({ x: 0, y: 0 });
            }}
            onLostPointerCapture={() => {
              touch.current = { x: 0, y: 0 };
              setStick({ x: 0, y: 0 });
            }}
          >
            <span style={{ transform: `translate(${stick.x}px,${stick.y}px)` }}>
              ✥
            </span>
          </button>
          <div>
            {action("Shift", l("Dash", "Lướt"), "↯", hud.player.dashCooldown)}
            {action("e", l("Burst", "Bộc"), "✧", hud.player.burstCooldown)}
            {action(" ", l("Strike", "Đánh"), "✦", 0)}
          </div>
        </div>
      </div>
    </dialog>
  );
}
