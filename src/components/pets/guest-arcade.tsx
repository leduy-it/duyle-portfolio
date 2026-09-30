"use client";
import { useEffect, useRef, useState } from "react";
import type { OwnedPet } from "@/lib/pets/save";
import { petAppearance } from "@/lib/pets/appearance";
import { AtlasPet } from "./atlas-pet";

const experiences = [
  {
    id: "last-beacon",
    name: "Last Beacon",
    tag: "STRATEGY / 3D",
    source: "https://github.com/stackloomdev/last-beacon",
    en: "One island. Ten waves. Keep the light alive.",
    vi: "Một hòn đảo. Mười đợt tấn công. Giữ ngọn hải đăng sáng.",
    action: ["Defend the island", "Bảo vệ hòn đảo"],
    controls: [
      "Build on the glowing pads. Space starts a wave. Drag to orbit.",
      "Xây trên các bệ sáng. Space bắt đầu đợt mới. Kéo để xoay góc nhìn.",
    ],
  },
  {
    id: "orbital-garden",
    name: "Orbital Garden",
    tag: "OBSERVATORY / INTERACTIVE ART",
    source:
      "https://github.com/MartinDelophy/awesome-gpt-6-astra/tree/main/works/orbital-garden",
    en: "48,000 points of light. A universe at your fingertips.",
    vi: "48.000 điểm sáng. Một vũ trụ trong tầm tay.",
    action: ["Enter the observatory", "Vào đài quan sát"],
    controls: [
      "Touch to disturb the stars. Choose a new formation. Sound is optional.",
      "Chạm để khuấy động các vì sao. Đổi hình thái. Bật âm thanh nếu thích.",
    ],
  },
] as const;
export function GuestArcade({ vi, pet }: { vi: boolean; pet: OwnedPet }) {
  const [active, setActive] = useState<(typeof experiences)[number] | null>(
    null,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const launch = useRef<HTMLButtonElement | null>(null);
  const appearance = petAppearance(pet.species, pet.stage);
  const companionQuery = new URLSearchParams({
    pet: appearance.pet,
    file: appearance.file,
    stage: String(pet.stage),
  }).toString();
  useEffect(() => {
    if (!active) return;
    const node = dialog.current!;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.showModal();
    return () => {
      node.close();
      document.body.style.overflow = previous;
      launch.current?.focus({ preventScroll: true });
    };
  }, [active]);
  return (
    <section className="guest-arcade" id="guest-arcade">
      <div className="arcade-heading">
        <span className="pet-eyebrow">THE AFTER-HOURS ARCADE</span>
        <h2>
          {vi
            ? "Qua cánh cổng. Mang pet theo."
            : "Step through. Bring your pet."}
        </h2>
        <p>
          {vi
            ? "Pet bạn chọn sẽ xuất hiện trong cả hai thế giới: giúp phòng thủ mỗi đợt và khuấy động ánh sáng trong đài quan sát."
            : "Your selected pet joins both worlds: lend a hand each defense wave and awaken the lights in the observatory."}
        </p>
      </div>
      <div className="arcade-portals">
        {experiences.map((game) => (
          <article className={`arcade-portal portal-${game.id}`} key={game.id}>
            <div className="portal-art" aria-hidden="true" />
            <div className="portal-pet" aria-hidden="true">
              <AtlasPet {...appearance} lane="waving" />
            </div>
            <div className="portal-copy">
              <span>{game.tag}</span>
              <h3>{game.name}</h3>
              <p>{vi ? game.vi : game.en}</p>
              <button
                className="pet-button"
                onClick={(e) => {
                  launch.current = e.currentTarget;
                  setActive(game);
                }}
              >
                {game.action[vi ? 1 : 0]} <span>↗</span>
              </button>
              <small>
                {vi
                  ? "Mang pet đang chọn theo"
                  : "Your selected pet comes along"}{" "}
                ·{" "}
                <a href={game.source} target="_blank" rel="noreferrer">
                  {vi ? "Mã nguồn" : "Source"} ↗
                </a>
              </small>
            </div>
          </article>
        ))}
      </div>
      {active && (
        <dialog
          ref={dialog}
          className="arcade-dialog"
          onCancel={() => setActive(null)}
          aria-label={active.name}
        >
          <header>
            <div>
              <strong>{active.name}</strong>
              <span>
                {active.controls[vi ? 1 : 0]} ·{" "}
                {vi
                  ? "Chạm pet trong game để tương tác"
                  : "Tap your pet in the game to interact"}
              </span>
            </div>
            <button
              autoFocus
              onClick={() => setActive(null)}
              aria-label={vi ? "Đóng trò chơi" : "Close experience"}
            >
              ×
            </button>
          </header>
          <iframe
            src={`/play/${active.id}/index.html?${companionQuery}`}
            title={active.name}
            allow="fullscreen"
          />
          <footer>
            <span>
              {vi
                ? "Pet đồng hành từ thế giới của bạn"
                : "Your companion from Pocket World"}
            </span>
            <a href={active.source} target="_blank" rel="noreferrer">
              {vi ? "Nguồn và giấy phép" : "Source and license"} ↗
            </a>
          </footer>
        </dialog>
      )}
    </section>
  );
}
