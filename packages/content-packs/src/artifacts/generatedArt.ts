type Palette = [string, string];

type ThumbnailOptions = {
  recipeId: string;
  title: string;
  tag: string;
  palette: Palette;
};

type PosterOptions = {
  recipeId: string;
  primaryName: string;
  resultKey: string;
  resultTitle: string;
  body: string;
  insight: string;
  accent: string;
  presentPortraitImageDataUrl?: string;
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

type PastLifePosterProfile = {
  headline: string;
  presentName: string;
  presentNature: string;
  pastName: string;
  pastGift: string;
  storyTitle: string;
  storyBody: string;
  monogram: string;
};

function buildPastLifePosterProfile(options: PosterOptions): PastLifePosterProfile {
  const pastName = derivePastLifeEchoName(options.primaryName);
  const normalizedInsight = options.insight.trim().replace(/\.$/, "");
  const monogram = (options.primaryName.trim()[0] ?? "N").toUpperCase();
  const softBody = options.body.trim().replace(/\.$/, "");

  switch (options.resultKey) {
    case "royal":
      return {
        headline: "YOUR NAME STILL REMEMBERS A PAST LIFE. WHO WERE YOU?",
        presentName: options.primaryName,
        presentNature: "Grace under pressure",
        pastName,
        pastGift: "Protective and composed",
        storyTitle: "Past Life Story",
        storyBody: `The name ${pastName} carries the feeling of someone who knew how to protect what mattered without ever looking rushed. ${softBody} This reading suggests a past self that stayed elegant in public but fierce in private.`,
        monogram
      };
    case "mythic":
      return {
        headline: "YOUR NAME STILL REMEMBERS A PAST LIFE. WHO WERE YOU?",
        presentName: options.primaryName,
        presentNature: "Fearless spirit",
        pastName,
        pastGift: "Leads with courage",
        storyTitle: "Past Life Story",
        storyBody: `The name ${pastName} feels like it belonged to someone people remembered long after they left the room. ${softBody} This result points to a past life shaped by bold choices, dramatic loyalty, and a presence that refused to fade quietly.`,
        monogram
      };
    case "familiar":
    default:
      return {
        headline: "YOUR NAME STILL REMEMBERS A PAST LIFE. WHO WERE YOU?",
        presentName: options.primaryName,
        presentNature: normalizedInsight.length > 44 ? "Heart-led and trusted" : normalizedInsight,
        pastName,
        pastGift: "Warmth people trusted",
        storyTitle: "Past Life Story",
        storyBody: `The name ${pastName} carries the kind of warmth people trusted before they could explain why. ${softBody} This reading points to a past self who kept promises, protected closeness, and made others feel safe simply by staying steady.`,
        monogram
      };
  }
}

export function buildGeneratedPosterDataUrl(options: PosterOptions): string {
  if (options.recipeId !== "past-life-vintage-poster") {
    return "";
  }

  const profile = buildPastLifePosterProfile(options);
  const headlineLines = wrapText(profile.headline, 24).slice(0, 2);
  const storyLines = wrapText(profile.storyBody, 44).slice(0, 7);
  const portraitMarkup = options.portraitImageDataUrl
    ? `<image href="${options.portraitImageDataUrl}" x="626" y="324" width="260" height="316" preserveAspectRatio="xMidYMid slice" clip-path="url(#frameClipRight)" />`
    : `
      <rect x="626" y="324" width="260" height="316" fill="#ece0cf" clip-path="url(#frameClipRight)"/>
      <ellipse cx="756" cy="454" rx="88" ry="116" fill="#dac5b2"/>
      <circle cx="756" cy="410" r="68" fill="#f4e9da"/>
      <path d="M678 410c12-58 144-90 160 6 8 42-2 118-14 172H692c-18-60-24-126-14-178z" fill="#47372a"/>
    `;
  const presentPortraitMarkup = options.presentPortraitImageDataUrl
    ? `<image href="${options.presentPortraitImageDataUrl}" x="194" y="324" width="260" height="316" preserveAspectRatio="xMidYMid slice" clip-path="url(#frameClipLeft)" />`
    : `
      <rect x="194" y="324" width="260" height="316" fill="#efe3d0" clip-path="url(#frameClipLeft)"/>
      <circle cx="324" cy="424" r="86" fill="rgba(93,55,36,0.08)"/>
      <circle cx="324" cy="452" r="74" fill="#f3e8da" stroke="#d7c7af" stroke-width="4"/>
      <text x="324" y="474" text-anchor="middle" font-family="Georgia, serif" font-size="88" font-weight="700" fill="#6a4c39">${escapeXml(profile.monogram)}</text>
    `;

  return svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1580" viewBox="0 0 1080 1580">
      <defs>
        <clipPath id="frameClipLeft">
          <rect x="194" y="324" width="260" height="316" rx="10"/>
        </clipPath>
        <clipPath id="frameClipRight">
          <rect x="626" y="324" width="260" height="316" rx="10"/>
        </clipPath>
      </defs>
      <rect width="1080" height="1580" rx="30" fill="#f7f1e6"/>
      <rect x="32" y="32" width="1016" height="1516" rx="38" fill="#f6efe3" stroke="#e2d4bd" stroke-width="4"/>
      <rect x="48" y="48" width="984" height="1484" rx="30" fill="none" stroke="#efe2cb" stroke-width="2"/>
      <text x="540" y="136" text-anchor="middle" font-family="Georgia, serif" font-size="62" font-weight="700" fill="#17120f">
        ${headlineLines
          .map((line, index) => `<tspan x="540" dy="${index === 0 ? 0 : 72}">${escapeXml(line)}</tspan>`)
          .join("")}
      </text>
      <rect x="154" y="272" width="340" height="410" rx="12" fill="none" stroke="#2f2418" stroke-width="5"/>
      <path d="M192 272v42h-38v326h38v42" fill="none" stroke="#2f2418" stroke-width="4"/>
      <path d="M456 272v42h38v326h-38v42" fill="none" stroke="#2f2418" stroke-width="4"/>
      <rect x="586" y="272" width="340" height="410" rx="12" fill="none" stroke="#2f2418" stroke-width="5"/>
      <path d="M624 272v42h-38v326h38v42" fill="none" stroke="#2f2418" stroke-width="4"/>
      <path d="M888 272v42h38v326h-38v42" fill="none" stroke="#2f2418" stroke-width="4"/>
      ${presentPortraitMarkup}
      <text x="324" y="562" text-anchor="middle" font-family="Georgia, serif" font-size="24" letter-spacing="6" fill="#9b7759">PRESENT</text>
      ${portraitMarkup}
      <text x="756" y="562" text-anchor="middle" font-family="Georgia, serif" font-size="24" letter-spacing="6" fill="#9b7759">PAST LIFE</text>
      <text x="324" y="736" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#8b5f3c">Present Name</text>
      <text x="324" y="790" text-anchor="middle" font-family="Georgia, serif" font-size="50" fill="#2f2418">${escapeXml(profile.presentName)}</text>
      <text x="324" y="858" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#8b5f3c">Present Nature</text>
      <text x="324" y="908" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="#2f2418">${escapeXml(profile.presentNature)}</text>
      <text x="756" y="736" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#8b5f3c">Past Name</text>
      <text x="756" y="790" text-anchor="middle" font-family="Georgia, serif" font-size="50" fill="#2f2418">${escapeXml(profile.pastName)}</text>
      <text x="756" y="858" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#8b5f3c">Past Gift</text>
      <text x="756" y="908" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="#6a4c39">${escapeXml(profile.pastGift)}</text>
      <text x="540" y="1020" text-anchor="middle" font-family="Georgia, serif" font-size="60" font-style="italic" fill="#8b5f3c">${escapeXml(profile.storyTitle)}</text>
      <text x="104" y="1110" font-family="Georgia, serif" font-size="38" fill="#2f2418">
        ${storyLines.map((line, index) => `<tspan x="104" dy="${index === 0 ? 0 : 48}">${escapeXml(line)}</tspan>`).join("")}
      </text>
      <line x1="104" y1="1424" x2="976" y2="1424" stroke="#e2d4bd" stroke-width="2"/>
      <text x="104" y="1468" font-family="Georgia, serif" font-size="28" font-style="italic" fill="#8b6e53">Result band: ${escapeXml(options.resultTitle)}</text>
    </svg>
  `);
}
