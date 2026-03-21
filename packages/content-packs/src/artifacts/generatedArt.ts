type Palette = [string, string];

type ThumbnailOptions = {
  recipeId: string;
  title: string;
  tag: string;
  palette: Palette;
};

type PosterOptions = {
  recipeId: string;
  headline: string;
  primaryName: string;
  derivedName: string;
  body: string;
  insight: string;
  accent: string;
  portraitImageDataUrl?: string;
};

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
      continue;
    }
    line = next;
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

function renderThumbnailFrame(options: ThumbnailOptions, body: string, extraArt: string): string {
  const [start, end] = options.palette;
  return svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="860" viewBox="0 0 640 860">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
        <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff9ec" stop-opacity="0.92" />
          <stop offset="100%" stop-color="#fff9ec" stop-opacity="0.15" />
        </linearGradient>
      </defs>
      <rect width="640" height="860" rx="44" fill="url(#bg)" />
      <rect x="36" y="36" width="568" height="788" rx="36" fill="rgba(255,250,244,0.88)" />
      <rect x="62" y="66" width="516" height="408" rx="28" fill="url(#glow)" />
      ${extraArt}
      <rect x="78" y="98" width="176" height="42" rx="21" fill="rgba(255,255,255,0.92)" />
      <text x="166" y="126" text-anchor="middle" font-family="Georgia, serif" font-size="24" letter-spacing="3" fill="#7b4f2d">${escapeXml(options.tag.toUpperCase())}</text>
      <text x="78" y="544" font-family="Georgia, serif" font-size="52" font-weight="700" fill="#1b1310">
        ${wrapText(options.title.toUpperCase(), 18)
          .slice(0, 3)
          .map((line, index) => `<tspan x="78" dy="${index === 0 ? 0 : 58}">${escapeXml(line)}</tspan>`)
          .join("")}
      </text>
      <text x="78" y="742" font-family="Georgia, serif" font-size="30" fill="#6d5b49">
        ${wrapText(body, 28)
          .slice(0, 3)
          .map((line, index) => `<tspan x="78" dy="${index === 0 ? 0 : 36}">${escapeXml(line)}</tspan>`)
          .join("")}
      </text>
    </svg>
  `);
}

export function buildGeneratedThumbnailDataUrl(options: ThumbnailOptions): string {
  switch (options.recipeId) {
    case "vintage-portrait-thumb":
      return renderThumbnailFrame(
        options,
        "Vintage echo portrait with a forgotten story and a name destiny twist.",
        `
          <rect x="120" y="128" width="400" height="286" rx="18" fill="#efe2cf" stroke="#2c2116" stroke-width="6"/>
          <ellipse cx="320" cy="254" rx="126" ry="138" fill="#d7c2a7"/>
          <circle cx="320" cy="226" r="86" fill="#f8ecde"/>
          <path d="M236 224c10-66 164-92 176 6 6 42-4 120-14 168H246c-18-58-24-126-10-174z" fill="#48372a"/>
        `
      );
    case "aura-portrait-thumb":
      return renderThumbnailFrame(
        options,
        "Human-photo-led aura art with bright color identity and screenshot energy.",
        `
          <circle cx="320" cy="248" r="162" fill="rgba(255,255,255,0.18)"/>
          <circle cx="320" cy="248" r="122" fill="rgba(255,255,255,0.26)"/>
          <circle cx="320" cy="214" r="84" fill="#f6e9dd"/>
          <path d="M228 404c8-82 196-82 184 0H228z" fill="#2f2c5b"/>
        `
      );
    case "headline-tabloid-thumb":
      return renderThumbnailFrame(
        options,
        "Scroll-stopping headline card with public drama and big feed energy.",
        `
          <rect x="96" y="128" width="448" height="286" rx="18" fill="#fff6ed"/>
          <rect x="96" y="128" width="448" height="54" fill="#c63b2d"/>
          <text x="320" y="164" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="700" fill="#fff9f1">BREAKING</text>
          <rect x="126" y="210" width="188" height="170" rx="12" fill="#d3c3b3"/>
          <rect x="336" y="210" width="170" height="18" rx="9" fill="#dfc6a9"/>
          <rect x="336" y="246" width="154" height="18" rx="9" fill="#dfc6a9"/>
          <rect x="336" y="282" width="146" height="18" rx="9" fill="#dfc6a9"/>
        `
      );
    case "touch-reveal-thumb":
      return renderThumbnailFrame(
        options,
        "Touch-to-reveal teaser with hidden art and a strong interaction cue.",
        `
          <rect x="110" y="128" width="420" height="286" rx="22" fill="#ecf8f0" stroke="#2e6f58" stroke-width="4" stroke-dasharray="10 10"/>
          <circle cx="458" cy="348" r="44" fill="rgba(255,255,255,0.82)" stroke="#2e6f58" stroke-width="5"/>
          <path d="M436 348h44M458 326v44" stroke="#2e6f58" stroke-width="6" stroke-linecap="round"/>
          <circle cx="252" cy="246" r="86" fill="rgba(46,111,88,0.18)"/>
          <path d="M212 314c0-42 90-42 90 0" fill="#2e6f58"/>
        `
      );
    case "duo-romance-thumb":
      return renderThumbnailFrame(
        options,
        "Editorial chemistry card with two leads and an emotional heat cue.",
        `
          <circle cx="246" cy="236" r="102" fill="rgba(255,255,255,0.22)"/>
          <circle cx="396" cy="236" r="102" fill="rgba(255,255,255,0.22)"/>
          <circle cx="228" cy="226" r="64" fill="#f8ecde"/>
          <circle cx="412" cy="226" r="64" fill="#f8ecde"/>
          <path d="M164 344c10-66 120-66 132 0H164z" fill="#3b2246"/>
          <path d="M344 344c10-66 120-66 132 0H344z" fill="#54202e"/>
          <path d="M320 212c18-28 68-12 68 24 0 48-68 88-68 88s-68-40-68-88c0-36 50-52 68-24z" fill="#ff6b7a" opacity="0.82"/>
        `
      );
    case "future-oracle-thumb":
      return renderThumbnailFrame(
        options,
        "Fortune-card teaser with glossy oracle iconography and future pull.",
        `
          <rect x="132" y="136" width="376" height="270" rx="26" fill="#1f254f"/>
          <circle cx="320" cy="222" r="74" fill="#ffd166" opacity="0.88"/>
          <path d="M320 170l16 40 44 4-34 28 10 42-36-24-36 24 10-42-34-28 44-4z" fill="#fff6d2"/>
          <rect x="226" y="310" width="188" height="16" rx="8" fill="rgba(255,246,210,0.72)"/>
        `
      );
    case "group-badge-thumb":
      return renderThumbnailFrame(
        options,
        "Social-role badge card with a strong label-driven identity reveal.",
        `
          <circle cx="320" cy="234" r="132" fill="rgba(255,255,255,0.18)"/>
          <circle cx="268" cy="228" r="42" fill="#f8ecde"/>
          <circle cx="372" cy="228" r="42" fill="#f8ecde"/>
          <path d="M218 342c12-64 100-64 112 0H218z" fill="#2d5f6d"/>
          <path d="M310 342c12-64 100-64 112 0H310z" fill="#4f7480"/>
          <rect x="216" y="150" width="208" height="44" rx="22" fill="#ffd166"/>
          <text x="320" y="178" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="700" fill="#47321c">ROLE</text>
        `
      );
    case "storybook-cover-thumb":
      return renderThumbnailFrame(
        options,
        "Story cover thumbnail with softly illustrated mood and curiosity-first framing.",
        `
          <rect x="126" y="126" width="388" height="288" rx="26" fill="rgba(255,245,232,0.72)" stroke="#7d5a42" stroke-width="6"/>
          <circle cx="320" cy="232" r="92" fill="rgba(255,255,255,0.24)"/>
          <path d="M244 326c10-74 152-74 152 0H244z" fill="#6d3d4f"/>
          <path d="M266 210c10-54 98-70 120 4 8 28 2 70-12 112H274c-18-48-20-86-8-116z" fill="#3c2730"/>
        `
      );
    case "movie-poster-thumb":
      return renderThumbnailFrame(
        options,
        "Cinematic poster thumbnail with dramatic silhouette and bright title weight.",
        `
          <rect x="112" y="130" width="416" height="282" rx="24" fill="#17131f"/>
          <circle cx="320" cy="214" r="126" fill="rgba(255,145,77,0.16)"/>
          <path d="M240 344c10-88 160-88 160 0H240z" fill="#201a2d"/>
          <circle cx="320" cy="214" r="76" fill="#f8ecde"/>
          <rect x="154" y="362" width="332" height="18" rx="9" fill="rgba(255,255,255,0.22)"/>
        `
      );
    default:
      return renderThumbnailFrame(options, "Editorial story card with a stronger human-photo-led curiosity hook.", "");
  }
}

export function derivePastLifeEchoName(name: string): string {
  const seed = Array.from(name || "echo").reduce((total, character) => total + character.charCodeAt(0), 0);
  const pool = ["Stanley", "Mira", "Theo", "Adeline", "Lucien", "Eliza", "Nadia", "Rowan", "Iris", "Felix"];
  return pool[seed % pool.length];
}

export function buildGeneratedPosterDataUrl(options: PosterOptions): string {
  if (options.recipeId !== "past-life-vintage-poster") {
    return "";
  }

  const bodyLines = wrapText(options.body, 54).slice(0, 5);
  const insightLines = wrapText(options.insight, 48).slice(0, 2);
  const portraitMarkup = options.portraitImageDataUrl
    ? `<image href="${options.portraitImageDataUrl}" x="618" y="280" width="268" height="332" preserveAspectRatio="xMidYMid slice" clip-path="url(#frameClipRight)" />`
    : `
      <ellipse cx="752" cy="448" rx="92" ry="118" fill="#dbc7b4"/>
      <circle cx="752" cy="404" r="72" fill="#f3e7d7"/>
      <path d="M668 404c12-56 150-90 168 4 8 38-2 126-14 180H686c-22-62-28-128-18-184z" fill="#47372a"/>
    `;

  return svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1500" viewBox="0 0 1080 1500">
      <defs>
        <clipPath id="frameClipLeft">
          <rect x="194" y="280" width="268" height="332" rx="8"/>
        </clipPath>
        <clipPath id="frameClipRight">
          <rect x="618" y="280" width="268" height="332" rx="8"/>
        </clipPath>
      </defs>
      <rect width="1080" height="1500" rx="30" fill="#f5efe2"/>
      <rect x="28" y="28" width="1024" height="1444" rx="34" fill="#f6f0e5" stroke="#e2d5bf" stroke-width="4"/>
      <text x="76" y="116" font-family="Georgia, serif" font-size="64" font-weight="700" fill="#16120f">${escapeXml(options.headline.toUpperCase())}</text>
      <rect x="146" y="238" width="364" height="420" rx="10" fill="none" stroke="#2f2418" stroke-width="5"/>
      <path d="M188 238v42h-42v336h42v42" fill="none" stroke="#2f2418" stroke-width="4"/>
      <path d="M468 238v42h42v336h-42v42" fill="none" stroke="#2f2418" stroke-width="4"/>
      <rect x="570" y="238" width="364" height="420" rx="10" fill="none" stroke="#2f2418" stroke-width="5"/>
      <path d="M612 238v42h-42v336h42v42" fill="none" stroke="#2f2418" stroke-width="4"/>
      <path d="M892 238v42h42v336h-42v42" fill="none" stroke="#2f2418" stroke-width="4"/>
      <rect x="194" y="280" width="268" height="332" fill="#efe2cf" clip-path="url(#frameClipLeft)"/>
      <circle cx="328" cy="410" r="86" fill="#f5eadb"/>
      <path d="M242 412c14-58 152-90 170 10 8 46-2 110-20 180H264c-26-74-28-130-22-190z" fill="#564235"/>
      ${portraitMarkup}
      <text x="328" y="704" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#8b5f3c">Present Name:</text>
      <text x="328" y="758" text-anchor="middle" font-family="Georgia, serif" font-size="48" fill="#2f2418">${escapeXml(options.primaryName)}</text>
      <text x="328" y="826" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#8b5f3c">Personality:</text>
      <text x="328" y="878" text-anchor="middle" font-family="Georgia, serif" font-size="44" fill="#2f2418">${escapeXml(options.insight)}</text>
      <text x="752" y="704" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#8b5f3c">Past Life Name:</text>
      <text x="752" y="758" text-anchor="middle" font-family="Georgia, serif" font-size="48" fill="#2f2418">${escapeXml(options.derivedName)}</text>
      <text x="752" y="826" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#8b5f3c">Gentle Side:</text>
      <text x="752" y="878" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="${options.accent}">${escapeXml(options.headline)}</text>
      <text x="540" y="980" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-style="italic" fill="#8b5f3c">Past Life</text>
      <text x="84" y="1068" font-family="Georgia, serif" font-size="36" fill="#2f2418">
        ${bodyLines.map((line, index) => `<tspan x="84" dy="${index === 0 ? 0 : 46}">${escapeXml(line)}</tspan>`).join("")}
      </text>
      <text x="84" y="1324" font-family="Georgia, serif" font-size="30" font-style="italic" fill="#6c5b4a">
        ${insightLines.map((line, index) => `<tspan x="84" dy="${index === 0 ? 0 : 38}">${escapeXml(line)}</tspan>`).join("")}
      </text>
    </svg>
  `);
}
