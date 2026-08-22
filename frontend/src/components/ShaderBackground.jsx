import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    vec3 obsidian = vec3(0.02, 0.02, 0.02);
    vec3 charcoal = vec3(0.04, 0.04, 0.05);
    vec3 gold = vec3(0.83, 0.68, 0.21);

    float t = u_time * 0.2;
    vec2 p1 = p;
    for(float i = 1.0; i < 4.0; i++) {
        p1.x += 0.3 / i * sin(i * 3.0 * p1.y + t);
        p1.y += 0.3 / i * cos(i * 3.0 * p1.x + t);
    }

    float noise = hash(uv + t * 0.01) * 0.02;

    float mask = sin(p1.x * 2.0 + p1.y * 2.0 + t) * 0.5 + 0.5;
    mask = pow(mask, 4.0);

    float goldVein = smoothstep(0.48, 0.5, sin(p1.x * 5.0 + t) * cos(p1.y * 3.0 - t));
    goldVein *= mask * 0.3;

    vec3 finalColor = mix(obsidian, charcoal, uv.y);
    finalColor += gold * goldVein;
    finalColor += noise;

    float vignette = smoothstep(1.5, 0.5, length(p));
    finalColor *= vignette;

    gl_FragColor = vec4(finalColor, 1.0);
}`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export function ShaderBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
    observer?.observe(canvas);
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return () => observer?.disconnect();

    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
