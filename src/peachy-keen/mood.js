import { Color, PointLight } from "three";
import { reducedMotion } from "./util";

const DIM = { hemi: 0.3, exposure: 0.92, rose: 2.6, rim: 1.8, env: 0.5 };
const MATTE = { specular: 0.25, sheen: 0.45 };
const DEEP_ROSE = new Color(0xff1f5c);
const EMBER = new Color(0xff5a2a);
const WINE = new Color(0x2a0414);

export class MoodLight {
  constructor(scene, renderer, { hemi, rose, peachRim }) {
    Object.assign(this, { scene, renderer, hemi, rose, rim: peachRim });
    this.base = {
      hemi: hemi.intensity,
      hemiSky: hemi.color.clone(),
      hemiGround: hemi.groundColor.clone(),
      rose: rose.intensity,
      roseColor: rose.color.clone(),
      rim: peachRim.intensity,
      rimColor: peachRim.color.clone(),
      exposure: renderer.toneMappingExposure,
    };
    this.candle = new PointLight(0xffa060, 0, 14);
    this.candle.position.set(-3.6, -0.6, 1.8);
    scene.add(this.candle);
    this.halo = new PointLight(0xff3d8b, 0, 16);
    this.halo.position.set(2.8, 3.2, -2.2);
    scene.add(this.halo);
    this.amount = 0;
    this.target = 0;
    this.time = 0;
    this.overlay = document.createElement("div");
    this.overlay.className = "mood-light";
    this.overlay.setAttribute("aria-hidden", "true");
    this.overlay.innerHTML = "<i></i><i></i><i></i><i></i>";
    document.body.appendChild(this.overlay);
    this.shown = -1;
    this.dimmed = -1;
    this.redim = 0;
  }

  set(on) {
    this.target = on ? 1 : 0;
  }

  flicker() {
    if (reducedMotion.matches) return 1;
    const t = this.time;
    return (
      0.85 +
      0.08 * Math.sin(t * 7.3) +
      0.05 * Math.sin(t * 13.1 + 1.7) +
      0.04 * Math.sin(t * 23.9 + 0.4)
    );
  }

  dimReflections(scale) {
    this.scene.traverse(({ material }) => {
      if (material?.envMapIntensity === undefined) return;
      const { userData } = material;
      userData.moodBase ??= material.envMapIntensity;
      material.envMapIntensity = userData.moodBase * scale;
      if (!userData.matteInMood) return;
      userData.moodSpecular ??= material.specularIntensity;
      userData.moodSheen ??= material.sheen;
      const k = this.amount;
      material.specularIntensity =
        userData.moodSpecular * (1 + (MATTE.specular - 1) * k);
      material.sheen = userData.moodSheen * (1 + (MATTE.sheen - 1) * k);
    });
  }

  update(delta, heat) {
    this.time += delta;
    const settled = Math.abs(this.target - this.amount) < 0.001;
    if (settled && this.amount === 0) return;
    this.amount = settled
      ? this.target
      : this.amount +
        (this.target - this.amount) * (1 - Math.exp(-delta * 2.5));
    const k = this.amount;
    const { base } = this;
    const lerp = (from, to) => from + (to - from) * k;

    this.hemi.intensity = lerp(base.hemi, base.hemi * DIM.hemi);
    this.hemi.color.copy(base.hemiSky).lerp(EMBER, k * 0.35);
    this.hemi.groundColor.copy(base.hemiGround).lerp(WINE, k);
    this.rose.intensity = lerp(
      base.rose,
      base.rose * DIM.rose * (1 + heat * 0.4),
    );
    this.rose.color.copy(base.roseColor).lerp(DEEP_ROSE, k);
    this.rim.intensity = lerp(base.rim, base.rim * DIM.rim);
    this.rim.color.copy(base.rimColor).lerp(EMBER, k);
    this.candle.intensity = k * 26 * this.flicker();
    this.halo.intensity = k * (130 + heat * 70);
    this.redim -= delta;
    // Also re-runs every second so materials created while mood is on get dimmed.
    if (k !== this.dimmed || this.redim <= 0) {
      this.dimmed = k;
      this.redim = 1;
      this.dimReflections(lerp(1, DIM.env));
    }
    this.renderer.toneMappingExposure = lerp(
      base.exposure,
      base.exposure * DIM.exposure,
    );

    const opacity = Math.round(k * 100) / 100;
    if (opacity !== this.shown) {
      this.shown = opacity;
      this.overlay.style.opacity = opacity;
      this.overlay.style.visibility = opacity ? "" : "hidden";
    }
  }
}
