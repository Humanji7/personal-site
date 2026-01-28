import * as THREE from 'three';
import { Text } from 'troika-three-text';

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export class ManifestoText {
  constructor() {
    this.group = new THREE.Group();
    this.lines = [];
    this.trails = [];

    this.font =
      'https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@2.304/fonts/ttf/JetBrainsMono-Regular.ttf';
    this.content = [
      'Личность — это малый бизнес',
      'Соло — это честно',
      'AI — это суперкостюм',
      'Смелость — единственный билет',
      'Сияние, не прилипание',
    ];

    this._baseY = 0.24;
    this._lineGap = 0.14;
  }

  init() {
    // Title line (post-void entry). Keep subtle; the void already has emergence text.
    const title = new Text();
    title.text = 'О. Ты дошёл.';
    title.font = this.font;
    title.fontSize = 0.08;
    title.anchorX = 'center';
    title.anchorY = 'middle';
    title.textAlign = 'center';
    title.color = 0xffffff;
    title.fillOpacity = 0;
    title.position.set(0, 0.55, 0.2);
    title.sync();
    this.group.add(title);
    this.title = title;

    for (let i = 0; i < this.content.length; i++) {
      const t = new Text();
      t.text = this.content[i];
      t.font = this.font;
      t.fontSize = 0.055;
      t.anchorX = 'center';
      t.anchorY = 'middle';
      t.textAlign = 'center';
      t.color = 0xffffff;
      t.fillOpacity = 0;
      t.position.set(0, this._baseY - i * this._lineGap, 0.2);
      t.sync();
      this.group.add(t);
      this.lines.push(t);

      // Motion blur (safe approximation): multiple ghost copies along motion direction.
      const ghosts = [];
      for (let g = 0; g < 3; g++) {
        const ghost = new Text();
        ghost.text = this.content[i];
        ghost.font = this.font;
        ghost.fontSize = 0.055;
        ghost.anchorX = 'center';
        ghost.anchorY = 'middle';
        ghost.textAlign = 'center';
        ghost.color = 0xffffff;
        ghost.fillOpacity = 0;
        ghost.position.set(0, this._baseY - i * this._lineGap, 0.19 - g * 0.002);
        ghost.sync();
        this.group.add(ghost);
        ghosts.push(ghost);
      }
      this.trails.push(ghosts);
    }
  }

  tick({ postProgress, ramps, quality, now }) {
    if (!this.title) return;

    const enter = ramps?.enter ?? smoothstep(0.0, 0.08, postProgress);
    const fly = ramps?.manifestoFly ?? smoothstep(0.4, 0.6, postProgress);

    const reducedMotion = quality.tier === 'static';

    // Title: appears quickly then yields.
    const titleIn = smoothstep(0.0, 0.05, postProgress);
    const titleOut = smoothstep(0.18, 0.28, postProgress);
    this.title.fillOpacity = titleIn * (1 - titleOut);

    // Lines: sequential fade-in (0..0.2), readable (0.2..0.4), fly away (0.4..0.6).
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];

      const s0 = 0.02 + i * 0.03;
      const s1 = s0 + 0.06;
      const inA = smoothstep(s0, s1, postProgress);
      const hold = smoothstep(0.18, 0.22, postProgress) * (1 - smoothstep(0.38, 0.42, postProgress));

      const baseOpacity = Math.max(inA, hold);
      const opacity = baseOpacity * (1 - fly);
      line.fillOpacity = opacity;

      const baseY = this._baseY - i * this._lineGap;

      if (reducedMotion) {
        line.position.set(0, baseY, 0.2);
        for (const ghost of this.trails[i]) ghost.fillOpacity = 0;
        continue;
      }

      // Fly direction: slight radial + drift.
      const dirX = (i % 2 === 0 ? -1 : 1) * (0.25 + i * 0.03);
      const dirY = 0.8 + i * 0.06;
      const wobble = Math.sin(now * 1.7 + i * 1.3) * 0.015;
      const px = dirX * fly;
      const py = baseY + dirY * fly + wobble * enter;
      line.position.set(px, py, 0.2);

      // Ghost trails appear only during fly-away.
      const trailStrength = fly * opacity;
      const len = Math.max(1e-4, Math.sqrt(dirX * dirX + dirY * dirY));
      const nx = dirX / len;
      const ny = dirY / len;
      for (let g = 0; g < this.trails[i].length; g++) {
        const ghost = this.trails[i][g];
        const off = (g + 1) * 0.06 * fly;
        ghost.position.set(px - nx * off, py - ny * off, 0.19 - g * 0.002);
        ghost.fillOpacity = trailStrength * (0.25 / (g + 1));
      }
    }
  }
}
