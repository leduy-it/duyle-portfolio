/* Pets extension for the locally hosted arcade games. Source licenses stay beside each game. */
(() => {
  const query = new URLSearchParams(location.search);
  const pet = query.get("pet") || "";
  const file = query.get("file") || "";
  const stage = Math.max(0, Math.min(2, Number(query.get("stage")) || 0));
  if (!/^[a-z0-9-]+$/.test(pet) || !/^[a-z0-9-]+\.webp$/.test(file)) return;

  const style = document.createElement("style");
  style.textContent = `
    .pet-arcade-companion{position:fixed;right:16px;bottom:18px;z-index:2147483000;display:flex;align-items:end;gap:7px;pointer-events:none;filter:drop-shadow(0 9px 16px #031710ab)}
    .pet-arcade-companion button{pointer-events:auto;width:84px;height:93px;padding:0;border:0;background:transparent;cursor:pointer;position:relative;transition:transform .2s}
    .pet-arcade-companion button:hover,.pet-arcade-companion button:focus-visible{transform:translateY(-6px)}
    .pet-arcade-companion button:focus-visible{outline:2px solid #dcf3ac;outline-offset:2px;border-radius:12px}
    .pet-arcade-companion .pet-image{display:block;width:84px;height:91px;background-size:800% 1100%;background-position:0 0;background-repeat:no-repeat;animation:pet-arcade-idle 1.2s steps(7,end) infinite}
    .pet-arcade-companion .pet-note{display:block;margin-bottom:16px;padding:8px 11px;background:#102b28e8;border:1px solid #ceeca268;border-radius:9px;color:#eaf6d7;font:11px/1.3 system-ui,sans-serif;white-space:nowrap;backdrop-filter:blur(8px)}
    .pet-arcade-companion.is-pulsing .pet-image{animation:pet-arcade-hop .55s ease-out}
    @keyframes pet-arcade-idle{to{background-position-x:100%}}
    @keyframes pet-arcade-hop{50%{transform:translateY(-17px) rotate(-5deg)}}
    @media(max-width:680px){.pet-arcade-companion{right:6px;bottom:6px}.pet-arcade-companion.is-beacon{bottom:145px}.pet-arcade-companion button,.pet-arcade-companion .pet-image{width:62px;height:68px}.pet-arcade-companion .pet-note{font-size:9px;max-width:106px;white-space:normal}}
    @media(prefers-reduced-motion:reduce){.pet-arcade-companion .pet-image,.pet-arcade-companion.is-pulsing .pet-image{animation:none}.pet-arcade-companion button{transition:none}}
  `;
  document.head.append(style);
  const root = document.createElement("div");
  root.className = "pet-arcade-companion";
  if (location.pathname.includes("/last-beacon/"))
    root.classList.add("is-beacon");
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "Ask your pet for help");
  const sprite = document.createElement("span");
  sprite.className = "pet-image";
  sprite.setAttribute("aria-hidden", "true");
  sprite.style.backgroundImage = `url("/pets/hatch-pet-plus/${pet}/${file}")`;
  button.append(sprite);
  const note = document.createElement("span");
  note.className = "pet-note";
  note.setAttribute("role", "status");
  note.textContent = "Your pet is here ✦";
  root.append(note, button);
  document.body.append(root);

  let game = null;
  let wave = -1;
  let available = false;
  let pulseTimer = 0;
  function pulse(message) {
    note.textContent = message;
    root.classList.remove("is-pulsing");
    void root.offsetWidth;
    root.classList.add("is-pulsing");
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => root.classList.remove("is-pulsing"), 600);
  }
  button.addEventListener("click", () => {
    if (location.pathname.includes("/last-beacon/")) {
      if (!game || game.phase !== "wave" || !available) {
        pulse("Ready next wave ✦");
        return;
      }
      available = false;
      const heal = Math.min(100 - game.hp, 7 + stage * 3);
      if (heal > 0) {
        game.hp += heal;
        pulse(`Pet shield +${heal} ♡`);
      } else {
        const gift = 10 + stage * 5;
        game.credits += gift;
        pulse(`Pet found +${gift} ◈`);
      }
    } else {
      document.getElementById("release")?.click();
    }
  });
  window.PetBridge = {
    onWave(next) {
      const newRun = game !== next;
      game = next;
      if (newRun || wave !== next.wave) {
        wave = next.wave;
        available = true;
        pulse("Pet help ready ✦");
      }
    },
    onBloom(state) {
      const amount = 0.08 + stage * 0.04;
      state.energy = Math.min(1, state.energy + amount);
      const energy = document.getElementById("energy");
      const value = document.getElementById("energy-value");
      if (energy) energy.value = String(Math.round(state.energy * 100));
      if (value) value.value = `${Math.round(state.energy * 100)}%`;
      pulse("Pet resonance ✦");
    },
  };
})();
