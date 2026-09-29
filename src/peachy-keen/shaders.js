import { ShaderMaterial, Vector2 } from "three";

const VERTEX_SHADER = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
    }
`;

export function createBackgroundMaterial() {
  return new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      heat: { value: 0 },
      disco: { value: 0 },
      kick: { value: 0 },
      beat: { value: 0 },
      ballAt: { value: new Vector2(0, 0.43) },
      resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: `
            uniform float time;
            uniform float heat;
            uniform float disco;
            uniform float kick;
            uniform float beat;
            uniform vec2 ballAt;
            uniform vec2 resolution;
            varying vec2 vUv;

            const mat2 OCTAVE_ROT = mat2(0.8, 0.6, -0.6, 0.8);

            float hash(vec2 p) {
                p = fract(p * vec2(123.34, 456.21));
                p += dot(p, p + 45.32);
                return fract(p.x * p.y);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            float fbm(vec2 p) {
                float v = 0.0;
                float a = 0.5;
                for (int i = 0; i < 5; i++) {
                    v += a * noise(p);
                    p = OCTAVE_ROT * p * 2.03;
                    a *= 0.5;
                }
                return v;
            }

            vec3 palette(float x) {
                x = fract(x) * 4.0;
                vec3 teal = vec3(0.12, 0.40, 0.46);
                vec3 violet = vec3(0.32, 0.26, 0.60);
                vec3 berry = vec3(0.58, 0.22, 0.46);
                vec3 oceanBlue = vec3(0.16, 0.30, 0.58);
                vec3 c = mix(teal, violet, smoothstep(0.0, 1.0, x));
                c = mix(c, berry, smoothstep(1.0, 2.0, x));
                c = mix(c, oceanBlue, smoothstep(2.0, 3.0, x));
                return mix(c, teal, smoothstep(3.0, 4.0, x));
            }

            float motes(vec2 p, float t, float density, float rise) {
                p.y -= t * rise;
                vec2 g = p * density;
                vec2 id = floor(g);
                vec2 f = fract(g) - 0.5;
                float h = hash(id);
                vec2 o = (vec2(hash(id + 7.1), hash(id + 3.7)) - 0.5) * 0.6;
                o += 0.15 * vec2(sin(t * 0.3 + h * 6.28), cos(t * 0.23 + h * 12.0));
                float twinkle = pow(0.5 + 0.5 * sin(t * (0.5 + h) + h * 40.0), 8.0);
                return step(0.9, h) * twinkle * smoothstep(0.05, 0.0, length(f - o));
            }

            vec3 hue(float x) {
                return 0.5 + 0.5 * cos(6.2831 * (x + vec3(0.0, 0.33, 0.67)));
            }

            vec3 club(vec2 p, float smoke) {
                vec2 d = p - ballAt;
                float dist = length(d);
                float ang = atan(d.x, -d.y);
                vec3 light = vec3(0.0);
                for (int k = 0; k < 6; k++) {
                    float fk = float(k);
                    float swing = sin(beat * 3.14159 * (0.125 + 0.03 * fk) + fk * 1.9);
                    float a = (fk - 2.5) * 0.32 + swing * 0.45;
                    float cone = 0.012 + dist * 0.035;
                    float beam = smoothstep(cone, 0.0, abs(ang - a) * dist);
                    beam *= smoothstep(0.03, 0.2, dist) * smoothstep(1.5, 0.3, dist);
                    float pulse = mod(fk, 2.0) < 0.5 ? kick : 1.0 - kick;
                    light += hue(fk / 6.0 + beat * 0.02) * beam * (0.2 + 0.8 * smoke) * (0.25 + 0.75 * pulse);
                }

                float spin = beat * 0.06;
                vec2 polar = vec2((ang + spin) * 9.0, log(dist + 0.02) * 9.0);
                vec2 cell = floor(polar);
                vec2 f = fract(polar) - 0.5;
                float h = hash(cell);
                vec2 jitter = (vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5) * 0.4;
                float spot = step(0.62, h) * smoothstep(0.2, 0.06, length(f - jitter));
                light += hue(h * 3.0 + beat * 0.05) * spot * (0.18 + 0.4 * kick) * smoothstep(0.08, 0.35, dist);

                float floorGlow = smoothstep(-0.15, -0.55, p.y);
                float tiles = 0.5 + 0.5 * sin(p.x * 7.0 + floor(beat) * 2.1);
                light += hue(floor(beat) * 0.13 + p.x * 0.2) * floorGlow * tiles * (0.12 + 0.28 * kick);

                float haze = exp(-dist * dist * 6.0);
                light += vec3(1.0, 0.85, 1.0) * haze * (0.05 + 0.12 * kick);
                return light;
            }

            void main() {
                vec2 uv = vUv;
                float aspect = resolution.x / resolution.y;
                vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
                float t = time * 0.022;
                vec2 sp = p * 0.9;

                vec2 q = vec2(
                    fbm(sp + vec2(0.0, t)),
                    fbm(sp + vec2(5.2, 1.3) - t * 0.7)
                );
                vec2 r = vec2(
                    fbm(sp + 2.4 * q + vec2(1.7, 9.2) + t * 0.8),
                    fbm(sp + 2.4 * q + vec2(8.3, 2.8) - t * 0.6)
                );
                float smoke = fbm(sp + 2.2 * r);

                float phase = time * 0.004 + q.x * 0.35 + smoke * 0.15;
                vec3 deep = palette(phase) * 0.55;
                vec3 mid = palette(phase + 0.12);
                vec3 pale = mix(palette(phase + 0.25), vec3(1.0, 0.86, 0.80), 0.4);
                vec3 rose = mix(vec3(0.90, 0.46, 0.60), vec3(0.98, 0.30, 0.38), heat);
                vec3 ember = vec3(1.0, 0.80, 0.68);

                vec3 col = mix(deep, mid * 1.15, smoothstep(0.3, 0.62, smoke));
                col = mix(col, pale, smoothstep(0.5, 0.75, smoke) * clamp(length(r) * 0.7, 0.0, 1.0) * 0.6);
                col = mix(col, col * vec3(1.3, 0.75, 0.8) + rose * 0.08, heat * 0.5);

                vec2 w = p + 0.7 * r;
                float folds = sin(w.x * 2.6 + w.y * 1.8 + smoke * 5.0 + t * 3.0);
                float sheen = pow(0.5 + 0.5 * folds, 8.0);
                col += pale * sheen * (0.12 + 0.2 * smoke);

                float thread = exp(-pow((smoke - 0.52) * 22.0, 2.0));
                col += rose * thread * (0.1 + 0.18 * r.y);

                vec2 toSource = p - vec2(0.45 * aspect, 0.75);
                float shafts = fbm(vec2(atan(toSource.y, toSource.x) * 4.0, t * 1.2));
                shafts = pow(shafts, 3.0) * smoothstep(1.8, 0.0, length(toSource));
                col += mix(pale, ember, 0.4) * shafts * (0.2 + heat * 0.15) * (0.4 + smoke);

                float breath = 0.5 + 0.5 * sin(time * 0.25);
                float glow = exp(-dot(p, p) * 2.2) * (0.22 + 0.06 * breath + heat * 0.12);
                col += mix(vec3(1.0, 0.62, 0.50), rose, 0.3 + heat * 0.5) * glow * (0.5 + smoke);

                float dust = motes(p, time * 0.6, 9.0, 0.012) * 0.25 + motes(p * 1.6 + 3.1, time * 0.6, 9.0, 0.02) * 0.12;
                col += pale * dust * (0.3 + smoke);

                col *= mix(0.65, 1.0, smoothstep(1.4, 0.25, length(p * vec2(0.8, 1.0))));

                if (disco > 0.001) {
                    col = mix(col, col * vec3(0.35, 0.28, 0.5), disco * 0.7);
                    col += club(p, smoke) * disco;
                }

                gl_FragColor = vec4(col, 1.0);
            }
        `,
    depthTest: false,
    depthWrite: false,
  });
}

export function createBackdropBlitMaterial(smoke) {
  return new ShaderMaterial({
    uniforms: {
      tSmoke: { value: smoke },
      time: { value: 0 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: `
            uniform sampler2D tSmoke;
            uniform float time;
            varying vec2 vUv;

            float hash(vec2 p) {
                p = fract(p * vec2(123.34, 456.21));
                p += dot(p, p + 45.32);
                return fract(p.x * p.y);
            }

            void main() {
                vec3 col = texture2D(tSmoke, vUv).rgb;
                col += (hash(gl_FragCoord.xy + fract(time * 0.37) * 97.0) - 0.5) * 0.025;
                gl_FragColor = vec4(col, 1.0);
            }
        `,
    depthTest: false,
    depthWrite: false,
  });
}
