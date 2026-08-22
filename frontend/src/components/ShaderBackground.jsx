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
