import { PEACH_CONFIG } from "../config";

const SKINS = {
  classic: {
    tint: PEACH_CONFIG.SKIN_TINT,
    sheen: 0xffd6d0,
    metalness: 0,
    roughness: 1,
    env: 0.3,
  },
  gold: {
    tint: 0xffd36e,
    sheen: 0xfff0b0,
    metalness: 0.45,
    roughness: 1,
    env: 0.3,
  },
  midnight: {
    tint: 0x8a5aa8,
    sheen: 0xc090ff,
    metalness: 0,
    roughness: 1,
    env: 0.3,
  },
  chrome: {
    tint: 0xf4eef2,
    sheen: 0xffffff,
    metalness: 1,
    roughness: 0.3,
    env: 1.4,
  },
};

export function applySkin(peach, id) {
  const skin = SKINS[id] || SKINS.classic;
  const m = peach.material;
  if (!m) return;
  peach.skinTint.set(skin.tint);
  m.sheenColor.set(skin.sheen);
  m.metalness = skin.metalness;
  m.envMapIntensity = skin.env;
  m.userData.moodBase = skin.env;
  peach.skinRoughness = skin.roughness;
  peach.writeOil();
}
