"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PETS } from "@/data/pets/catalog";
import type { PetWorldSave } from "@/lib/pets/save";
import { FACTORY_CAP_MS, factoryYield } from "@/lib/pets/progression";
import { petAppearance } from "@/lib/pets/appearance";
import { AtlasPet } from "./atlas-pet";
import { MotionPet, motionCatalog } from "./motion-pet";
import "./pet-factory.css";

export function PetFactory({
  save,
  now,
  locked,
  vi,
  onCollect,
  onRecruit,
  onSelect,
}: {
  save: PetWorldSave;
  now: number;
  locked: boolean;
  vi: boolean;
  onCollect: () => void;
  onRecruit: () => void;
  onSelect: (id: string) => void;
}) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    let visible = false;
    const sync = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    if (root.current) observer.observe(root.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  const l = (en: string, vn: string) => (vi ? vn : en);
  const stock = factoryYield(save, now);
  const elapsed = Math.max(0, now - save.factoryAt);
  const full = elapsed >= FACTORY_CAP_MS;
  const progress = full ? 100 : (elapsed % 60000) / 600;
  const seconds = Math.ceil((60000 - (elapsed % 60000)) / 1000);
  const rate = save.pets.reduce((sum, pet) => sum + 2 + pet.stage, 0);
  const lead = save.pets.find((p) => p.id === save.selected) || save.pets[0];
  const [receipt, setReceipt] = useState("");
  return (
    <section
      ref={root}
      className="workshop"
      aria-label={l("Pet factory", "Xưởng Pets")}
      data-paused={full || locked || !active}
    >
      <header className="workshop-heading">
        <div>
          <span className="pet-eyebrow">PETS / THE LITTLE WORKS</span>
          <h2>{l("Small paws. Big ideas.", "Chân nhỏ. Ý tưởng lớn.")}</h2>
          <p>
            {l(
              "A little workshop that keeps a little of your world moving.",
              "Một góc xưởng, cả đội cùng làm nên điều hay.",
            )}
          </p>
        </div>
        <span className="workshop-status">
          <i />
          {locked
            ? l("Loading", "Đang tải")
            : full
              ? l("Storage full", "Kho đã đầy")
              : l("Production live", "Đang sản xuất")}
        </span>
      </header>
      <div className="workshop-metrics">
        <div>
          <small>{l("THE CREW", "ĐỘI THỢ")}</small>
          <strong>
            {save.pets.length}
            <span> pets</span>
          </strong>
        </div>
        <div>
          <small>{l("COIN OUTPUT", "NĂNG SUẤT XU")}</small>
          <strong>
            {rate}
            <span> ◈ / {l("min", "phút")}</span>
          </strong>
        </div>
        <div>
          <small>{l("MATERIAL OUTPUT", "NĂNG SUẤT VẬT LIỆU")}</small>
          <strong>
            {save.pets.length}
            <span> ✧ / {l("min", "phút")}</span>
          </strong>
        </div>
      </div>
      <div className="workshop-scene">
        <div className="workshop-window" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="workshop-pipe" aria-hidden="true" />
        <div className="workshop-line-label">
          <span>01 — {l("THE MAKING ROOM", "PHÒNG CHẾ TÁC")}</span>
          <span>
            {full ? "Ⅱ" : "●"} {l("AUTO", "TỰ ĐỘNG")}
          </span>
        </div>
        <div className="workshop-machines" aria-hidden="true">
          <div className="workshop-machine press">
            <span className="machine-code">PRESS / 01</span>
            <div className="press-head" />
            <div className="press-item">◈</div>
            <div className="machine-base">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="workshop-reactor">
            <span className="machine-code">CORE / 02</span>
            <div className="reactor-glass">
              <span>✧</span>
              <i />
              <i />
              <i />
            </div>
            <div className="machine-base">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="workshop-machine packer">
            <span className="machine-code">PACK / 03</span>
            <div className="packer-wheel">✳</div>
            <div className="packer-box">✦</div>
            <div className="machine-base">
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
        <div className="workshop-conveyor" aria-hidden="true">
          <div className="conveyor-track" />
          {Array.from({ length: 5 }, (_, i) => (
            <span
              className="conveyor-parcel"
              key={i}
              style={{ "--delay": `${-i * 2.4}s` } as CSSProperties}
            >
              ✦
            </span>
          ))}
        </div>
        <div className="workshop-assistants" aria-hidden="true">
          {save.pets
            .filter((p) => p.id !== lead.id)
            .slice(0, 3)
            .map((p) => (
              <AtlasPet
                key={p.id}
                {...petAppearance(p.species, p.stage)}
                lane="running"
              />
            ))}
        </div>
        <div className="workshop-foreman">
          {!full &&
          motionCatalog[petAppearance(lead.species, lead.stage).pet]?.carry ? (
            <MotionPet
              pet={petAppearance(lead.species, lead.stage).pet}
              clip="carry"
            />
          ) : (
            <AtlasPet
              {...petAppearance(lead.species, lead.stage)}
              lane={full ? "waiting" : "running"}
              follow
            />
          )}
          <span>
            {PETS[lead.species].name}
            <small>{l("On the floor", "Đang tại xưởng")}</small>
          </span>
        </div>
        <div className="workshop-cycle">
          <span>
            {full
              ? l("Collect to resume", "Thu hoạch để chạy tiếp")
              : l(`Next batch in ${seconds}s`, `Mẻ tiếp theo sau ${seconds}s`)}
          </span>
          <div
            role="progressbar"
            aria-label={l("Production cycle", "Chu kỳ sản xuất")}
            aria-valuenow={Math.floor(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <div className="workshop-vault">
        <div className="vault-title">
          <span className="pet-eyebrow">
            02 / {l("THE GOOD STUFF", "THÀNH PHẨM")}
          </span>
          <small>
            {stock.minutes} / 480 {l("batches", "mẻ")}
          </small>
        </div>
        <div className="vault-content">
          <div className="vault-amount">
            <strong>
              {stock.coins.toLocaleString()} <i>◈</i>
            </strong>
            <span>+</span>
            <strong>
              {stock.materials.toLocaleString()} <i>✧</i>
            </strong>
          </div>
          <button
            disabled={locked || !stock.minutes}
            onClick={() => {
              setReceipt(
                l(
                  `Collected ${stock.coins} coins + ${stock.materials} materials`,
                  `Đã nhận ${stock.coins} xu + ${stock.materials} vật liệu`,
                ),
              );
              onCollect();
            }}
          >
            {l("Collect batch", "Thu hoạch")} <span>↗</span>
          </button>
        </div>
        <div
          className="vault-meter"
          role="progressbar"
          aria-label={l("Storage capacity", "Dung lượng kho")}
          aria-valuenow={stock.minutes}
          aria-valuemin={0}
          aria-valuemax={480}
        >
          <i style={{ width: `${stock.minutes / 4.8}%` }} />
        </div>
        <p>
          {l(
            "Keeps producing while you’re away. Stores up to 8 hours.",
            "Vẫn tích lũy khi bạn đi vắng. Kho chứa tối đa 8 giờ.",
          )}
        </p>
        <output className="workshop-receipt" aria-live="polite">
          {receipt}
        </output>
      </div>
      <div className="workshop-crew-heading">
        <div>
          <span className="pet-eyebrow">
            03 / {l("MEET YOUR MAKERS", "ĐỘI THỢ NHỎ")}
          </span>
          <h3>{l("Everyone brings something.", "Mỗi bạn một chút tài.")}</h3>
        </div>
        <button disabled={locked} onClick={onRecruit}>
          {l("Hatch a teammate", "Nở thêm bạn")} ＋
        </button>
      </div>
      <div className="workshop-crew">
        {save.pets.map((p, i) => (
          <button
            disabled={locked}
            key={p.id}
            className="workshop-worker"
            aria-pressed={lead.id === p.id}
            onClick={() => onSelect(p.id)}
          >
            <span className="worker-number">
              {String(i + 1).padStart(2, "0")}
              <i>{lead.id === p.id ? "●" : "↗"}</i>
            </span>
            <AtlasPet {...petAppearance(p.species, p.stage)} follow />
            <strong>{PETS[p.species].name}</strong>
            <small>
              {2 + p.stage} ◈ + 1 ✧ / {l("min", "phút")}
            </small>
            <span className="worker-rank">
              {l("Stage", "Bậc")} {p.stage + 1} · {PETS[p.species].drop}
            </span>
          </button>
        ))}
      </div>
      <footer className="workshop-tip">
        <span>↗</span>
        <p>
          {l(
            "Hatch more pets to grow the crew. Evolve a pet to add +1 coin per minute for each stage.",
            "Nở thêm pet để tăng đội thợ. Mỗi bậc tiến hóa tăng thêm 1 xu/phút cho pet đó.",
          )}
        </p>
        <button
          disabled={locked}
          onClick={() => {
            onSelect(lead.id);
            document.getElementById("pet-resident")?.scrollIntoView({
              behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
              block: "center",
            });
          }}
        >
          {l("View evolution", "Xem tiến hóa")} ↗
        </button>
      </footer>
    </section>
  );
}
