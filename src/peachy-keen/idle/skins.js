import { PEACH_CONFIG } from "../config";

const PLAIN = {
  sheenAmount: 0.45,
  coat: 0,
  gloss: false,
  tone: 0,
  glitter: 0,
  iridescence: 0,
  glint: 0xffffff,
  pattern: [0, 0, 0],
  deep: 0x000000,
};

const SKINS = {
  classic: {
    ...PLAIN,
    edge: 0xff7f5c,
    tint: PEACH_CONFIG.SKIN_TINT,
    sheen: 0xffd6d0,
    metalness: 0,
    roughness: 1,
    env: 0.3,
  },
  gold: {
    ...PLAIN,
    edge: 0xff9d14,
    tint: PEACH_CONFIG.SKIN_TINT,
    sheen: 0xffd6d0,
    metalness: 0,
    roughness: 1,
    env: 0.3,
    glint: 0xffd27a,
    pattern: [2, 1, 1],
    deep: 0xe0860c,
  },
  midnight: {
    ...PLAIN,
    edge: 0x5a48ff,
    tint: 0x4a2266,
    sheen: 0xd29bff,
    sheenAmount: 1,
    metalness: 0.1,
    roughness: 0.8,
    env: 0.7,
    coat: 0.55,
    tone: 0.75,
    glitter: 0.7,
    iridescence: 0.6,
    glint: 0xd8c8ff,
    pattern: [1, 1, 1],
    deep: 0x1a3aa0,
  },
  chrome: {
    ...PLAIN,
    edge: 0xc8d4ff,
    tint: 0xf4eef2,
    sheen: 0xffffff,
    metalness: 1,
    roughness: 0.3,
    env: 1.4,
    gloss: true,
  },
};

export const SKIN_NAMES = {
  classic: "Classic",
  gold: "Honey glaze",
  midnight: "Midnight",
  chrome: "Chrome",
};

export function applySkin(peach, id) {
  const skin = SKINS[id] || SKINS.classic;
  const m = peach.material;
  if (!m) return;
  peach.skinTint.set(skin.tint);
  m.sheenColor.set(skin.sheen);
  m.sheen = skin.sheenAmount;
  m.metalness = skin.metalness;
  m.envMapIntensity = skin.env;
  m.userData.moodBase = skin.env;
  Object.assign(peach, {
    skinRoughness: skin.roughness,
    skinCoat: skin.coat,
    skinGloss: skin.gloss,
  });
  peach.uniforms.uSkinLook.value.set(
    skin.tone,
    skin.glitter,
    skin.iridescence,
    0,
  );
  peach.uniforms.uSkinGlint.value.set(skin.glint);
  peach.uniforms.uSkinPattern.value.set(...skin.pattern, skin.gloss ? 1 : 0);
  peach.uniforms.uSkinDeep.value.set(skin.deep);
  peach.writeOil();
}

export function switchSkin(peach, id, beats) {
  peach.fadeSkin((SKINS[id] || SKINS.classic).edge, beats);
  applySkin(peach, id);
}
