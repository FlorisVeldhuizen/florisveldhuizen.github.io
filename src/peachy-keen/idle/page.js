import "./idle.css";

export function preparePage() {
  const score = document.querySelector(".score");
  document.getElementById("count-unit").textContent = "juice";
  document.getElementById("bursts").remove();
  score.querySelector(".score-count").insertAdjacentHTML(
    "afterend",
    `<p id="rate" class="score-rate">0 per second</p>
    <p id="pits" class="score-pits" hidden></p>
    <p id="dare" class="score-dare" hidden></p>`,
  );
  score.insertAdjacentHTML("beforeend", '<div id="buffs" class="buffs"></div>');

  const settings = document.getElementById("settings");
  const dock = document.querySelector(".settings-dock");
  dock.insertAdjacentHTML(
    "beforebegin",
    `<aside id="panel" class="ui panel" aria-label="Shop">
      <button id="panel-handle" type="button" class="panel-handle" aria-expanded="false">
        <span>Open the shop</span>
      </button>
    </aside>`,
  );
  document.getElementById("panel").append(settings);
  settings.hidden = false;
  dock.remove();
  settings
    .querySelector('[data-setting="achievements"]')
    .closest(".settings-row")
    .remove();
}
