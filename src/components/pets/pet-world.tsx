"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { usePetSave } from "@/lib/pets/pet-save-provider";
import {
  PETS,
  SPECIES,
  EGGS,
  EVOLUTION,
  type Area,
  type EggTier,
} from "@/data/pets/catalog";
import {
  buyEgg,
  hatchEgg,
  warmEgg,
  placePet,
  collectFactory,
  evolvePet,
  cheerPet,
} from "@/lib/pets/progression";
import { PixelPet, PixelEgg } from "./pixel-art";
import { HabitatArt } from "./habitat-art";
import { HabitatDecor } from "./habitat-decor";
import { PetArena } from "./arena";
import "./pet-world.css";
import { PetFactory } from "./pet-factory";
import { SourceGallery } from "./source-gallery";
import "./pet-journey.css";
import { GuestArcade } from "./guest-arcade";
import "./pet-districts.css";
import { LivingPet } from "./living-pet";
import { AtlasPet } from "./atlas-pet";
import { WorldTransfer } from "./world-transfer";
import { petAppearance } from "@/lib/pets/appearance";
import { useCompanionSelection } from "@/lib/pets/companion-selection";
import { useCompanionPreference } from "@/lib/pets/companion-preference";

const areas: { id: Area; en: string; vi: string; icon: string }[] = [
  { id: "habitat", en: "The habitat", vi: "Ngôi nhà", icon: "⌂" },
  { id: "hatchery", en: "Eggs & friends", vi: "Trứng & bạn bè", icon: "◉" },
  { id: "factory", en: "Little factory", vi: "Xưởng nhỏ", icon: "⚒" },
  { id: "arena", en: "Wildwood", vi: "Thám hiểm", icon: "✦" },
];
export function PetWorld() {
  const { locale } = useLocale(),
    vi = locale === "vi",
    l = (en: string, vn: string) => (vi ? vn : en);
  const { save, storage, update, reset } = usePetSave();
  const companion = useCompanionSelection();
  const { visible: companionVisible, setVisible: showCompanion } =
    useCompanionPreference();
  const inspector = useRef<HTMLDialogElement>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [rosterFilter, setRosterFilter] = useState<"owned" | "all">("owned");
  const [rosterSearch, setRosterSearch] = useState("");
  const [scene, setScene] = useState<"grove" | "dusk" | "moon">("grove");
  const [now, setNow] = useState(0),
    [notice, setNotice] = useState(""),
    [placing, setPlacing] = useState(false),
    [reveal, setReveal] = useState<string | null>(null),
    [resetOpen, setResetOpen] = useState(false);
  useEffect(() => {
    if (!inspectorOpen) return;
    const node = inspector.current!;
    const trigger = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.showModal();
    return () => {
      node.close();
      document.body.style.overflow = overflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [inspectorOpen]);
  const pet = save.pets.find((p) => p.id === save.selected) || save.pets[0],
    info = PETS[pet.species],
    next = EVOLUTION[pet.stage];
  const appearance = petAppearance(pet.species, pet.stage);
  const changesForm =
    next && appearance.file !== petAppearance(pet.species, pet.stage + 1).file;
  const isCompanion =
    companion.pet.id === appearance.pet && companion.file === appearance.file;
  const habitatDrag = useRef<{
    id: string;
    x: number;
    y: number;
    moved: boolean;
    slot: number;
    position?: { x: number; y: number };
  } | null>(null);
  const habitatClick = useRef(false);
  const locked = storage === "loading" || storage === "newer";
  const canEvolve =
    next &&
    pet.xp >= next.xp &&
    save.coins >= next.coins &&
    save.materials >= next.materials;
  useEffect(() => {
    const initial = requestAnimationFrame(() => setNow(Date.now()));
    const timer = setInterval(() => {
      if (!document.hidden) setNow(Date.now());
    }, 1000);
    return () => {
      cancelAnimationFrame(initial);
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (!reveal) return;
    const t = setTimeout(() => setReveal(null), 2500);
    return () => clearTimeout(t);
  }, [reveal]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chapters = document.querySelectorAll<HTMLElement>(".pet-chapter");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.reveal = "visible";
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.04, rootMargin: "80px" },
    );
    chapters.forEach((chapter) => {
      if (chapter.getBoundingClientRect().top > innerHeight)
        chapter.dataset.reveal = "waiting";
      observer.observe(chapter);
    });
    return () => {
      observer.disconnect();
      chapters.forEach((chapter) => delete chapter.dataset.reveal);
    };
  }, []);
  function visit(area: Area) {
    update((s) => ({ ...s, area }));
    setPlacing(false);
    document.getElementById(`pet-chapter-${area}`)?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }
  function cheer() {
    const t = Date.now();
    update((s) => cheerPet(s, pet.id, t));
    setNotice(
      l(
        `${info.name} loves that. +3 XP, +2 coins, +1 gem.`,
        `${info.name} thích lắm. +3 XP, +2 xu, +1 ngọc.`,
      ),
    );
  }
  async function hatch(id: string) {
    const before = save.pets.length;
    const result = await update((s) => hatchEgg(s, id, Date.now()));
    if (result.pets.length > before) {
      setReveal(result.selected);
      setNotice(
        l(
          `Meet ${PETS[result.pets.at(-1)!.species].name}. Welcome home!`,
          `Chào ${PETS[result.pets.at(-1)!.species].name}. Về nhà rồi!`,
        ),
      );
    }
  }
  async function evolve() {
    const result = await update((s) => evolvePet(s, pet.id));
    if (
      (result.pets.find((p) => p.id === pet.id)?.stage ?? pet.stage) > pet.stage
    ) {
      setReveal(pet.id);
      setNotice(
        l(
          `${info.name} ${changesForm ? "evolved" : "ranked up"}. A little more extraordinary.`,
          `${info.name} ${changesForm ? "tiến hóa" : "lên bậc"} rồi. Lấp lánh hơn một chút.`,
        ),
      );
    }
  }
  return (
    <div className="pet-world">
      <div className="pet-world-shell">
        <div className="pet-breadcrumb">
          <Link href="/">DUY&apos;S PORTFOLIO</Link>
          <span>/</span>
          <span>{l("A SMALL SIDE QUEST", "MỘT GÓC VUI NHỎ")}</span>
        </div>
        <header className="pet-world-heading">
          <div className="pet-arrival-atmosphere" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="pet-arrival-copy">
            <span className="pet-eyebrow">
              <i className="pet-online-dot" />{" "}
              {l("A WORLD THAT REMEMBERS YOU", "THẾ GIỚI LUÔN NHỚ BẠN")}
            </span>
            <h1>
              {l("Pocket", "Pocket")} <em>World.</em>
            </h1>
            <p>
              {l(
                "A little home that keeps growing. Hatch a friend, build together, and follow the forest past the edge of the map.",
                "Một ngôi nhà nhỏ luôn lớn lên. Ấp trứng, cùng xây xưởng, rồi theo khu rừng ra khỏi rìa bản đồ.",
              )}
            </p>
            <div className="pet-arrival-actions">
              <button type="button" onClick={() => visit("habitat")}>
                {l("Enter your world", "Vào thế giới của bạn")} <span>↗</span>
              </button>
              <button type="button" data-track="pet:visit-arena" onClick={() => visit("arena")}>
                {l("Explore Wildwood", "Khám phá Wildwood")} <span>✦</span>
              </button>
            </div>
          </div>
          <div
            className="pet-arrival-companion"
            aria-label={l(
              "Your selected pet is here",
              "Pet bạn chọn đang ở đây",
            )}
          >
            <span className="pet-arrival-halo" aria-hidden="true" />
            <LivingPet species={pet.species} stage={pet.stage} />
            <span className="pet-arrival-shadow" aria-hidden="true" />
          </div>
          <div className="pet-arrival-footnote">
            <span>01 / {l("THE LIVING WORLD", "THẾ GIỚI SỐNG")}</span>
            <span>
              {save.pets.length} {l("friends at home", "bạn nhỏ ở nhà")} ·{" "}
              {l("progress saved", "đã lưu tiến trình")}
            </span>
          </div>
        </header>
        <div className="pet-world-toolbar">
          <nav aria-label={l("Pet world areas", "Khu vực thế giới pet")}>
            {areas.map((area) => (
              <button
                key={area.id}
                type="button"
                aria-current={save.area === area.id ? "page" : undefined}
                disabled={locked}
                onClick={() => {
                  visit(area.id);
                }}
              >
                <span aria-hidden="true">{area.icon}</span>
                {vi ? area.vi : area.en}
              </button>
            ))}
            <Link className="pet-arcade-route" href="/arcade">↗ Arcade</Link>
          </nav>
          <div className="pet-wallet">
            <span title={l("Coins", "Xu")}>
              <i>◈</i>
              {save.coins.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
            </span>
            <span title={l("Evolution gems", "Ngọc tiến hóa")}>
              <i>✧</i>
              {save.materials.toLocaleString(
                locale === "vi" ? "vi-VN" : "en-US",
              )}
            </span>
          </div>
        </div>
        {storage === "memory" && (
          <p className="pet-storage-note" role="status">
            {l(
              "Saving is paused. You can play for this visit; reload to recover your saved world.",
              "Đang tạm ngưng lưu. Bạn vẫn chơi được trong lần ghé này; tải lại trang để khôi phục thế giới đã lưu.",
            )}
          </p>
        )}
        {storage === "newer" && (
          <p className="pet-storage-note" role="alert">
            {l(
              "This world was saved by a newer version. Refresh to keep your progress safe.",
              "Thế giới được lưu từ bản mới hơn. Tải lại trang để giữ tiến trình an toàn.",
            )}
          </p>
        )}
        <div className="pet-main-grid">
          <div className="pet-main-area" aria-busy={locked}>
            {
              <section
                id="pet-chapter-habitat"
                className="pet-panel habitat-panel pet-chapter"
                data-scene={scene}
              >
                <div className={`pet-habitat ${placing ? "is-placing" : ""}`}>
                  <HabitatArt />
                  <HabitatDecor editing={placing} vi={vi} />
                  <div className="scene-atmosphere" aria-hidden="true">
                    {Array.from({ length: 12 }, (_, i) => (
                      <i
                        key={i}
                        style={{
                          left: `${7 + i * 7.5}%`,
                          top: `${16 + ((i * 17) % 65)}%`,
                          animationDelay: `${-i * 0.7}s`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="scene-title">
                    <span>YOUR LITTLE UNIVERSE</span>
                    <h2>
                      {scene === "grove"
                        ? "Bunny Grove"
                        : scene === "dusk"
                          ? "Amber Hour"
                          : "Moon Garden"}
                    </h2>
                    <small>
                      {save.pets.length} {l("friends at home", "bạn nhỏ ở nhà")}{" "}
                      · {l("drag to rearrange", "kéo thả để sắp xếp")}
                    </small>
                  </div>
                  <div
                    className="scene-switch"
                    aria-label={l("Change scenery", "Đổi khung cảnh")}
                  >
                    {(["grove", "dusk", "moon"] as const).map((value, i) => (
                      <button
                        key={value}
                        aria-pressed={scene === value}
                        onClick={() => setScene(value)}
                        title={["Bunny Grove", "Amber Hour", "Moon Garden"][i]}
                      >
                        {["☀", "◒", "☾"][i]}
                        <span>{["Grove", "Dusk", "Moon"][i]}</span>
                      </button>
                    ))}
                  </div>
                  <div className="habitat-slots">
                    {Array.from({ length: 12 }, (_, slot) => (
                      <button
                        type="button"
                        key={slot}
                        disabled={!placing || locked}
                        onClick={() => {
                          update((s) => placePet(s, pet.id, slot));
                          setPlacing(false);
                          setNotice(
                            l("A new favorite spot.", "Một góc yêu thích mới."),
                          );
                        }}
                        aria-label={l(
                          `Place ${info.name} in spot ${slot + 1}`,
                          `Đặt ${info.name} vào ô ${slot + 1}`,
                        )}
                        className="habitat-slot"
                      >
                        <span>{placing ? "＋" : ""}</span>
                      </button>
                    ))}
                  </div>
                  {save.pets.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      disabled={placing || locked}
                      onClick={() => {
                        if (habitatClick.current) {
                          habitatClick.current = false;
                          return;
                        }
                        update((s) => ({ ...s, selected: p.id }));
                        setInspectorOpen(true);
                      }}
                      onPointerDown={(e) => {
                        if (e.button !== 0) return;
                        habitatDrag.current = {
                          id: p.id,
                          x: e.clientX,
                          y: e.clientY,
                          moved: false,
                          slot: p.slot,
                        };
                        e.currentTarget.setPointerCapture(e.pointerId);
                      }}
                      onPointerMove={(e) => {
                        const d = habitatDrag.current;
                        if (!d || d.id !== p.id) return;
                        if (
                          !d.moved &&
                          Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6
                        )
                          return;
                        d.moved = true;
                        habitatClick.current = true;
                        const r =
                          e.currentTarget.parentElement!.getBoundingClientRect();
                        const x = Math.max(
                            14,
                            Math.min(
                              84,
                              ((e.clientX - r.left) / r.width) * 100,
                            ),
                          ),
                          y = Math.max(
                            46,
                            Math.min(
                              85,
                              ((e.clientY - r.top) / r.height) * 100,
                            ),
                          );
                        d.position = { x, y };
                        d.slot =
                          Math.max(0, Math.min(3, Math.round((x - 19) / 20))) +
                          4 *
                            Math.max(0, Math.min(2, Math.round((y - 42) / 18)));
                        e.currentTarget.style.left = `${x}%`;
                        e.currentTarget.style.top = `${y}%`;
                        e.currentTarget.dataset.dragging = "true";
                      }}
                      onPointerUp={(e) => {
                        const d = habitatDrag.current;
                        if (d?.moved) {
                          update((s) =>
                            placePet(
                              { ...s, selected: p.id },
                              p.id,
                              d.slot,
                              d.position,
                            ),
                          );
                          e.currentTarget.style.left = `${d.position?.x ?? 19 + (d.slot % 4) * 20}%`;
                          e.currentTarget.style.top = `${d.position?.y ?? 42 + Math.floor(d.slot / 4) * 18}%`;
                        }
                        delete e.currentTarget.dataset.dragging;
                        habitatDrag.current = null;
                      }}
                      onPointerCancel={(e) => {
                        e.currentTarget.style.left = `${p.position?.x ?? 19 + (p.slot % 4) * 20}%`;
                        e.currentTarget.style.top = `${p.position?.y ?? 42 + Math.floor(p.slot / 4) * 18}%`;
                        delete e.currentTarget.dataset.dragging;
                        habitatDrag.current = null;
                      }}
                      className={`habitat-pet ${save.selected === p.id ? "is-selected" : ""} ${reveal === p.id ? "is-celebrating" : ""}`}
                      style={
                        {
                          left: `${p.position?.x ?? 19 + (p.slot % 4) * 20 + (i > 11 ? (i % 3) * 2 : 0)}%`,
                          top: `${p.position?.y ?? 42 + Math.floor(p.slot / 4) * 18}%`,
                          "--pet-delay": `${-i * 1.7}s`,
                        } as CSSProperties
                      }
                      aria-label={l(
                        `Select ${PETS[p.species].name}`,
                        `Chọn ${PETS[p.species].name}`,
                      )}
                    >
                      <LivingPet
                        species={p.species}
                        stage={p.stage}
                        enabled={!placing}
                      />
                    </button>
                  ))}
                  <span className="habitat-butterfly" aria-hidden="true">
                    ❧
                  </span>
                </div>
                <div className="district-gates">
                  <button data-track="pet:visit-hatchery" onClick={() => visit("hatchery")}>
                    <span>01 / NURSERY</span>
                    <strong>{l("The greenhouse", "Nhà kính")}</strong>
                    <small>
                      {save.eggs.length} {l("eggs incubating", "trứng đang ấp")}{" "}
                      ↗
                    </small>
                  </button>
                  <button data-track="pet:visit-factory" onClick={() => visit("factory")}>
                    <span>02 / WORKSHOP</span>
                    <strong>{l("Production floor", "Xưởng sản xuất")}</strong>
                    <small>
                      {l("Your crew is at work", "Đội pet đang làm việc")} ↗
                    </small>
                  </button>
                  <button data-track="pet:visit-arena" onClick={() => visit("arena")}>
                    <span>03 / EXPEDITION</span>
                    <strong>{l("Into the wild", "Ra ngoài phiêu lưu")}</strong>
                    <small>
                      {l("Fight alongside your pet", "Chiến đấu cùng pet")} ↗
                    </small>
                  </button>
                </div>
                <div className="habitat-footer">
                  <div>
                    <strong>
                      {save.pets.length} {l("happy residents", "cư dân vui vẻ")}
                    </strong>
                    <p>
                      {l(
                        "Drag a friend anywhere in the meadow.",
                        "Kéo thả bạn nhỏ vào một góc đồng cỏ.",
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={locked}
                    className="pet-button"
                    aria-pressed={placing}
                    onClick={() => setPlacing(!placing)}
                  >
                    {placing
                      ? l("Cancel placement", "Hủy đặt")
                      : l("Rearrange home", "Sắp xếp nhà")}{" "}
                    <span>↗</span>
                  </button>
                </div>
              </section>
            }
            {
              <section
                id="pet-chapter-hatchery"
                className="pet-panel hatchery-panel pet-chapter"
              >
                <div className="pet-section-head">
                  <div>
                    <span className="pet-eyebrow">02 / SOMEBODY NEW</span>
                    <h2>
                      {l(
                        "Good things come in eggs.",
                        "Điều hay nằm trong trứng.",
                      )}
                    </h2>
                  </div>
                  <span className="pet-number">
                    {String(save.eggs.length).padStart(2, "0")}
                  </span>
                </div>
                <p className="pet-section-copy">
                  {l(
                    "Every egg has a friend inside. They hatch on their own schedule; a little warmth helps.",
                    "Trứng nào cũng có một bạn nhỏ. Cứ để thời gian làm việc, hoặc chạm để sưởi ấm nhanh hơn.",
                  )}
                </p>
                <div className="incubator-row" data-count={save.eggs.length}>
                  {save.eggs.length ? (
                    save.eggs.map((egg) => {
                      const ready = egg.readyAt <= now,
                        remaining = Math.ceil(
                          Math.max(0, egg.readyAt - now) / 1000,
                        );
                      return (
                        <div key={egg.id} className="incubator">
                          <div className="egg-orbit">
                            <PixelEgg
                              color={EGGS[egg.tier].color}
                              cracking={ready}
                            />
                          </div>
                          <strong>
                            {vi ? EGGS[egg.tier].vi : EGGS[egg.tier].name}
                          </strong>
                          <small>
                            {ready
                              ? l("Someone is knocking…", "Có ai đang gõ cửa…")
                              : `${remaining}s · ${l("getting cozy", "đang ấm dần")}`}
                          </small>
                          <button
                            className={`pet-button ${ready ? "primary" : ""}`}
                            disabled={locked || save.pets.length >= 36}
                            type="button"
                            onClick={() =>
                              ready
                                ? hatch(egg.id)
                                : update((s) => warmEgg(s, egg.id, Date.now()))
                            }
                          >
                            {ready
                              ? l("Say hello!", "Chào bạn mới!")
                              : l("Warm it up −8s", "Sưởi ấm −8s")}{" "}
                            ✦
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="incubator-empty">
                      {l(
                        "Everyone has hatched. Pick a new egg below.",
                        "Các bạn nở hết rồi. Chọn thêm một trứng bên dưới nhé.",
                      )}
                    </div>
                  )}
                </div>
                <div className="egg-shop">
                  <div className="pet-small-heading">
                    <h3>{l("The egg counter", "Quầy trứng")}</h3>
                    <span>
                      {l("In-game coins only", "Chỉ dùng xu trong game")}
                    </span>
                  </div>
                  <div className="egg-shop-grid">
                    {(Object.keys(EGGS) as EggTier[]).map((tier) => {
                      const e = EGGS[tier];
                      return (
                        <article
                          key={tier}
                          style={{ "--egg-color": e.color } as CSSProperties}
                        >
                          <PixelEgg color={e.color} />
                          <div>
                            <h4>{vi ? e.vi : e.name}</h4>
                            <p>
                              {e.roster.map((id) => PETS[id].name).join(" · ")}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={
                              locked ||
                              save.coins < e.price ||
                              save.eggs.length >= 12 ||
                              save.eggs.length + save.pets.length >= 36
                            }
                            onClick={() => {
                              update((s) => buyEgg(s, tier, Date.now()));
                              setNotice(
                                l(
                                  "One little possibility, coming right up.",
                                  "Thêm một niềm vui bé xíu.",
                                ),
                              );
                            }}
                          >
                            {e.price} ◈ <span>＋</span>
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
            }
            {
              <div id="pet-chapter-factory" className="pet-chapter">
                <PetFactory
                  save={save}
                  now={now}
                  locked={locked}
                  vi={vi}
                  onSelect={(id) => update((s) => ({ ...s, selected: id }))}
                  onRecruit={() => visit("hatchery")}
                  onCollect={() => {
                    const t = Date.now();
                    update((s) => collectFactory(s, t));
                    setNow(t);
                  }}
                />
              </div>
            }
            {
              <section
                id="pet-chapter-arena"
                className="pet-panel arena-panel pet-chapter"
              >
                <div className="pet-section-head">
                  <div>
                    <span className="pet-eyebrow">04 / BEYOND THE GARDEN</span>
                    <h2>
                      {l(
                        "A forest worth getting lost in.",
                        "Một khu rừng đáng để lạc bước.",
                      )}
                    </h2>
                  </div>
                  <span className="pet-pill">+90 ◈ / WIN</span>
                </div>
                <div className="expedition-party">
                  <div>
                    <span className="pet-eyebrow">
                      {l("CHOOSE YOUR EXPLORER", "CHỌN BẠN ĐỒNG HÀNH")}
                    </span>
                    <strong>
                      {l(
                        "Your pet enters the forest with you.",
                        "Pet của bạn cùng bước vào khu rừng.",
                      )}
                    </strong>
                  </div>
                  <div
                    className="expedition-party-list"
                    role="group"
                    aria-label={l("Expedition pet", "Pet thám hiểm")}
                  >
                    {save.pets.map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        disabled={locked}
                        aria-pressed={pet.id === candidate.id}
                        aria-label={l(
                          `Explore with ${PETS[candidate.species].name}`,
                          `Thám hiểm cùng ${PETS[candidate.species].name}`,
                        )}
                        onClick={() =>
                          update((s) => ({ ...s, selected: candidate.id }))
                        }
                      >
                        <AtlasPet
                          {...petAppearance(candidate.species, candidate.stage)}
                        />
                        <span>{PETS[candidate.species].name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <PetArena key={pet.id} pet={pet} vi={vi} />
              </section>
            }
            <section className="pet-roster">
              <div className="pet-small-heading">
                <h2>{l("The neighborhood", "Hàng xóm nhỏ")}</h2>
                <span>
                  {new Set(save.pets.map((p) => p.species)).size} /{" "}
                  {SPECIES.length} {l("discovered", "đã gặp")}
                </span>
              </div>
              <div className="roster-tools">
                <div
                  role="group"
                  aria-label={l("Collection filter", "Lọc bộ sưu tập")}
                >
                  <button
                    aria-pressed={rosterFilter === "owned"}
                    onClick={() => setRosterFilter("owned")}
                  >
                    {l("At home", "Ở nhà")} · {save.pets.length}
                  </button>
                  <button
                    aria-pressed={rosterFilter === "all"}
                    onClick={() => setRosterFilter("all")}
                  >
                    {l("All species", "Tất cả loài")} · {SPECIES.length}
                  </button>
                </div>
                <input
                  type="search"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder={l("Find a pet…", "Tìm pet…")}
                  aria-label={l("Search pets", "Tìm pet")}
                />
              </div>
              <div className="pet-roster-grid">
                {SPECIES.filter(
                  (species) =>
                    (rosterFilter === "all" ||
                      save.pets.some((p) => p.species === species)) &&
                    `${PETS[species].name} ${PETS[species].species} ${PETS[species].vi}`
                      .toLowerCase()
                      .includes(rosterSearch.toLowerCase()),
                ).map((species, i) => {
                  const owned = save.pets.find((p) => p.species === species),
                    p = PETS[species];
                  return (
                    <button
                      key={species}
                      type="button"
                      className={`roster-card ${pet.species === species ? "is-selected" : ""}`}
                      style={
                        {
                          "--pet-tint": p.color,
                          "--pet-delay": `${-i * 0.6}s`,
                        } as CSSProperties
                      }
                      onClick={() => {
                        if (owned) {
                          update((s) => ({ ...s, selected: owned.id }));
                          setInspectorOpen(true);
                        } else visit("hatchery");
                      }}
                      disabled={locked}
                      aria-pressed={owned ? pet.id === owned.id : undefined}
                    >
                      <span className="roster-number" aria-hidden="true">
                        0{i + 1}
                      </span>
                      <PixelPet species={species} stage={owned?.stage || 0} />
                      <strong>{p.name}</strong>
                      <small>{vi ? p.vi : p.species}</small>
                      <span className={`roster-owned ${owned ? "yes" : ""}`}>
                        {owned
                          ? "● " + l("at home", "ở nhà")
                          : "＋ " + l("discover", "khám phá")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
          <dialog
            ref={inspector}
            className={`pet-sidebar ${inspectorOpen ? "is-open" : ""}`}
            onCancel={() => setInspectorOpen(false)}
            aria-label={l("Pet details", "Thông tin pet")}
          >
            <button
              className="inspector-close pet-button"
              onClick={() => setInspectorOpen(false)}
              aria-label={l("Close pet details", "Đóng thông tin pet")}
            >
              ×
            </button>
            <section
              id="pet-resident"
              className={`pet-resident-card ${reveal === pet.id ? "is-celebrating" : ""}`}
              style={{ "--pet-tint": info.color } as CSSProperties}
            >
              <div className="resident-card-top">
                <span className="pet-eyebrow">
                  {l("YOUR LITTLE COMPANION", "NGƯỜI BẠN NHỎ")}
                </span>
                <span>0{pet.stage + 1}/03</span>
              </div>
              <div className="resident-portrait">
                <span className="portrait-orbit" />
                <PixelPet species={pet.species} stage={pet.stage} follow />
                <span className="resident-spark">✧</span>
              </div>
              <h2>
                {info.name}
                <span>✦</span>
              </h2>
              <p>
                {info.forms[pet.stage]} · {vi ? info.vi : info.species}
              </p>
              <button
                type="button"
                data-track="pet:cheer" className="pet-button resident-cheer"
                disabled={locked}
                onClick={cheer}
              >
                {l("A little encouragement", "Cổ vũ một chút")} ♡
              </button>
              <div className="evolution-track">
                <div>
                  <span>{l("Growing together", "Lớn lên cùng nhau")}</span>
                  <strong>{pet.xp} XP</strong>
                </div>
                <progress
                  value={pet.xp}
                  max={next?.xp || Math.max(100, pet.xp)}
                  aria-label={l("Evolution experience", "Kinh nghiệm tiến hóa")}
                />
                <div className="evolution-steps">
                  <span>○ {info.forms[0]}</span>
                  <span>◐ {info.forms[1]}</span>
                  <span>● {info.forms[2]}</span>
                </div>
              </div>
              {next ? (
                <div className="evolution-next">
                  <span className="pet-eyebrow">
                    {changesForm
                      ? l("NEXT FORM", "HÌNH THÁI TIẾP")
                      : l("NEXT GROWTH RANK", "BẬC TRƯỞNG THÀNH TIẾP")}
                  </span>
                  {changesForm && (
                    <div className="evolution-preview">
                      <PixelPet species={pet.species} stage={pet.stage} />
                      <span>→</span>
                      <PixelPet
                        species={pet.species}
                        stage={(pet.stage + 1) as 1 | 2}
                      />
                    </div>
                  )}
                  <h3>{info.forms[pet.stage + 1]}</h3>
                  <p>
                    {next.xp} XP · {next.coins} ◈ · {next.materials} ✧
                  </p>
                  <button
                    type="button"
                    className="pet-button primary"
                    disabled={locked || !canEvolve}
                    onClick={evolve}
                  >
                    {canEvolve
                      ? changesForm
                        ? l("Time to evolve", "Tiến hóa thôi")
                        : l("Grow to next rank", "Lên bậc tiếp theo")
                      : l("Keep growing", "Đang lớn dần")}{" "}
                    <span>✦</span>
                  </button>
                </div>
              ) : (
                <p className="pet-max-form">
                  ✦{" "}
                  {l(
                    "A little legend, fully grown.",
                    "Huyền thoại nhỏ đã lớn rồi.",
                  )}
                </p>
              )}
              <button
                className="pet-button companion-resident-set"
                disabled={isCompanion && companionVisible}
                onClick={() => {
                  companion.setCompanion(appearance.pet, pet.stage);
                  showCompanion(true);
                }}
              >
                {isCompanion
                  ? l("Your companion ✓", "Đang đồng hành ✓")
                  : l("Set as companion ↗", "Chọn đồng hành ↗")}
              </button>
            </section>
            <div className="pet-note">
              <span>↳</span>
              <p>
                {l(
                  "No starting over. This little world remembers you. Come back whenever.",
                  "Không cần chơi lại. Thế giới nhỏ này nhớ bạn. Rảnh thì ghé nhé.",
                )}
                <small>
                  {storage === "saved"
                    ? l("Saved in this browser", "Đã lưu trên trình duyệt này")
                    : storage === "loading"
                      ? l("Opening your world…", "Đang mở thế giới…")
                      : l("This visit only", "Chỉ trong lần ghé này")}
                </small>
              </p>
            </div>
            <button
              type="button"
              className="pet-reset-link"
              onClick={() => setResetOpen(true)}
              disabled={locked}
            >
              {l("Start a new world", "Tạo thế giới mới")}
            </button>
            {resetOpen && (
              <div className="pet-reset-confirm" role="alert">
                <p>
                  {l(
                    "Replace your pets and progress with a fresh starter world?",
                    "Thay toàn bộ pet và tiến trình bằng thế giới mới?",
                  )}
                </p>
                <button type="button" onClick={() => setResetOpen(false)}>
                  {l("Keep my world", "Giữ thế giới")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setResetOpen(false);
                    setNotice(
                      l("A new little beginning.", "Một khởi đầu mới."),
                    );
                  }}
                >
                  {l("Start fresh", "Tạo mới")}
                </button>
              </div>
            )}
          </dialog>
        </div>
        <GuestArcade vi={vi} pet={pet} />
        <SourceGallery vi={locale === "vi"} />
        <WorldTransfer vi={vi} />
        <footer className="pet-world-footer">
          <span>
            SMALL WORLD. BIG FEELINGS. <i>✳</i>
          </span>
          <p>
            {l(
              "Bunny and the animated gallery: Duy’s hatch-pet-plus.",
              "Bunny và thư viện animation từ hatch-pet-plus của Duy.",
            )}{" "}
            <a
              href="https://github.com/leduy-it/hatch-pet-plus"
              target="_blank"
              rel="noopener noreferrer"
            >
              {l("Project reference", "Repo tham chiếu")} ↗
            </a>
          </p>
        </footer>
      </div>
      <div className={`pet-toast ${notice ? "is-visible" : ""}`} role="status">
        {notice && <>✦ {notice}</>}
      </div>
    </div>
  );
}
