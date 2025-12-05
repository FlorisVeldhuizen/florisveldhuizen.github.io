import { ShaderMaterial, Vector2 } from "three";

// Shared vertex shader (used by both materials)
const VERTEX_SHADER = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
    }
`;

// Gradient colors
const COLOR_TOP = "vec3(0.42, 0.25, 0.45)"; // Violet
const COLOR_BOTTOM = "vec3(0.50, 0.30, 0.45)"; // Pink-violet

/**
 * Create a simple gradient background material (fallback when shader is disabled)
 * @returns {THREE.ShaderMaterial} The gradient background material
 */
export function createGradientBackgroundMaterial() {
  return new ShaderMaterial({
    uniforms: {
      resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: `
            varying vec2 vUv;
            
            void main() {
                vec2 center = vec2(0.5);
                float distFromCenter = length(vUv - center);
                
                // Vertical gradient
                vec3 gradientColor = mix(${COLOR_TOP}, ${COLOR_BOTTOM}, vUv.y);
                
                // Subtle radial variation
                gradientColor -= smoothstep(0.0, 1.0, distFromCenter) * 0.15;
                
                gl_FragColor = vec4(gradientColor, 1.0);
            }
        `,
    depthTest: false,
    depthWrite: false,
  });
}

/**
 * Create the animated background shader material
 * @returns {THREE.ShaderMaterial} The background shader material
 */
export function createBackgroundMaterial() {
  return new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: `
            uniform float time;
            uniform vec2 resolution;
            varying vec2 vUv;
            
            // Constants for better performance
            const vec2 HASH_MULT = vec2(123.34, 456.21);
            const float HASH_DOT = 45.32;
            const float PI = 3.14159265359;
            const float TWO_PI = 6.28318530718;
            
            // Noise function for organic patterns (optimized)
            float hash(vec2 p) {
                p = fract(p * HASH_MULT);
                p += dot(p, p + HASH_DOT);
                return fract(p.x * p.y);
            }
            
            // Optimized noise with smoothstep
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f); // Hermite interpolation
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            // Optimized HSL to RGB conversion
            vec3 hsl2rgb(vec3 hsl) {
                float c = (1.0 - abs(2.0 * hsl.z - 1.0)) * hsl.y;
                float h6 = hsl.x * 6.0;
                float x = c * (1.0 - abs(mod(h6, 2.0) - 1.0));
                float m = hsl.z - c * 0.5;
                
                vec3 rgb = vec3(0.0);
                if (h6 < 1.0) rgb = vec3(c, x, 0.0);
                else if (h6 < 2.0) rgb = vec3(x, c, 0.0);
                else if (h6 < 3.0) rgb = vec3(0.0, c, x);
                else if (h6 < 4.0) rgb = vec3(0.0, x, c);
                else if (h6 < 5.0) rgb = vec3(x, 0.0, c);
                else rgb = vec3(c, 0.0, x);
                
                return rgb + m;
            }
            
            // Simplified reaction-diffusion pattern
            float reactionDiffusion(vec2 uv, float t) {
                // Multiple octaves for detail
                float scale1 = 3.0;
                float scale2 = 8.0;
                float scale3 = 15.0;
                
                // Slow-moving liquid flow
                vec2 flow1 = vec2(cos(t * 0.1), sin(t * 0.15)) * 0.3;
                vec2 flow2 = vec2(sin(t * 0.08), cos(t * 0.12)) * 0.5;
                
                // Layered noise for reaction-diffusion-like patterns
                float n1 = noise((uv + flow1) * scale1);
                float n2 = noise((uv + flow2) * scale2);
                float n3 = noise((uv - flow1 * 0.5) * scale3);
                
                // Create spots and patterns similar to reaction-diffusion
                float pattern = n1 * 0.6 + n2 * 0.25 + n3 * 0.15;
                
                // Add liquid-like threshold behavior
                pattern = smoothstep(0.4, 0.6, pattern);
                
                // Add some slow variation
                pattern += sin(t * 0.5 + uv.x * 2.0) * 0.05;
                pattern += cos(t * 0.3 + uv.y * 3.0) * 0.05;
                
                return pattern;
            }
            
            void main() {
                vec2 uv = vUv;
                
                // Calculate distance from center for radial gradient
                vec2 center = vec2(0.5, 0.5);
                float distFromCenter = length(uv - center);
                
                // Create smooth vignette effect (0 at center, 1 at edges)
                float vignette = smoothstep(0.0, 0.9, distFromCenter);
                
                // FUNKY flowing plasma with chromatic warping (subtle)
                vec2 warp = vec2(
                    sin(time * 0.4 + uv.y * 4.0 + cos(time * 0.25) * 1.5),
                    cos(time * 0.35 + uv.x * 4.0 + sin(time * 0.2) * 1.5)
                ) * 0.18;
                
                vec2 flow1 = uv + warp + vec2(sin(time * 0.3 + uv.y * 3.0), cos(time * 0.2 + uv.x * 3.0)) * 0.15;
                vec2 flow2 = uv - warp * 0.5 + vec2(cos(time * 0.25 + uv.y * 4.0), sin(time * 0.35 + uv.x * 4.0)) * 0.12;
                vec2 flow3 = uv + vec2(sin(time * 0.4 - uv.x * 2.0), cos(time * 0.3 - uv.y * 2.0)) * 0.18;
                vec2 flow4 = uv + vec2(cos(time * 0.15 + uv.y * 6.0), sin(time * 0.18 + uv.x * 6.0)) * 0.1;
                
                // Multiple layers of flowing noise with different scales
                float n1 = noise(flow1 * 4.0);
                float n2 = noise(flow2 * 7.0);
                float n3 = noise(flow3 * 3.0);
                float n4 = noise(flow4 * 10.0);
                
                // Combine noise layers for ultra plasma effect
                float plasma = (n1 * 0.4 + n2 * 0.3 + n3 * 0.2 + n4 * 0.1);
                plasma = pow(plasma, 1.3); // Enhance contrast but keep it smooth
                
                // Create liquid simulation for additional trippy detail
                float liquid = reactionDiffusion(uv, time);
                
                // Funky color cycling - multiple hue layers (subtle)
                // Use smooth sinusoidal cycling instead of mod for seamless transitions
                float baseHue = sin(time * 0.022) * 0.5 + 0.5;
                float hueWobble = sin(time * 0.6 + plasma * TWO_PI) * 0.05;
                float hue1 = fract(baseHue + plasma * 0.25 + liquid * 0.1 + hueWobble);
                float hue2 = fract(baseHue + plasma * 0.35 + liquid * 0.12 - hueWobble);
                
                // Pulsating saturation for extra funkiness (subtle)
                float satPulse = sin(time * 0.7) * 0.05 + 0.95;
                float saturation1 = mix(0.6, 0.35, vignette) * satPulse;
                float saturation2 = mix(0.55, 0.3, vignette) * satPulse;
                saturation1 += plasma * 0.15;
                saturation2 += n4 * 0.12;
                
                // Dynamic brightness with pulsing (subtle)
                float brightPulse = sin(time * 0.5 + plasma * PI) * 0.03 + 1.0;
                float centerBoost = 0.20;
                float edgeDarkness = 0.09;
                float lightness1 = mix(centerBoost, edgeDarkness, vignette) * brightPulse;
                lightness1 += plasma * 0.12 + liquid * 0.05;
                float lightness2 = mix(centerBoost + 0.04, edgeDarkness + 0.02, vignette) * brightPulse;
                lightness2 += n2 * 0.10 + liquid * 0.04;
                
                // Create multiple color layers
                vec3 color1 = hsl2rgb(vec3(hue1, saturation1, lightness1));
                vec3 color2 = hsl2rgb(vec3(hue2, saturation2, lightness2));
                
                // Mix colors based on plasma with smooth blending
                vec3 finalColor = mix(color1, color2, plasma * 0.7 + 0.3);
                
                // Add subtle complementary color splashes
                float accentHue1 = fract(hue1 + 0.5);
                float accentHue2 = fract(hue2 + 0.33);
                vec3 accentColor1 = hsl2rgb(vec3(accentHue1, saturation1 * 0.85, lightness1 * 0.75));
                vec3 accentColor2 = hsl2rgb(vec3(accentHue2, saturation2 * 0.8, lightness2 * 0.7));
                
                finalColor = mix(finalColor, accentColor1, liquid * 0.12);
                finalColor = mix(finalColor, accentColor2, n4 * 0.08);
                
                // Chromatic aberration-style color split (subtle)
                float chromaticShift = sin(time * 0.35 + distFromCenter * 3.5) * 0.012;
                vec3 chromaticR = hsl2rgb(vec3(hue1 + chromaticShift, saturation1, lightness1));
                vec3 chromaticB = hsl2rgb(vec3(hue2 - chromaticShift, saturation2, lightness2));
                finalColor = vec3(
                    mix(finalColor.r, chromaticR.r, 0.08),
                    finalColor.g,
                    mix(finalColor.b, chromaticB.b, 0.08)
                );
                
                // Pulsating glow at center (subtle)
                float glow = smoothstep(0.6, 0.0, distFromCenter) * (0.12 + sin(time * 1.0) * 0.04);
                finalColor += glow;
                
                // Softer vignette to let the funk shine through
                finalColor *= (1.0 - vignette * 0.5);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
    depthTest: false,
    depthWrite: false,
  });
}
