import type { ArtifactTemplate } from "./artifactPresentation";

type ShareCardOptions = {
  brandLabel: string;
  hook: string;
  testLabel: string;
  title: string;
  score: string;
  body: string;
  insight: string;
  signature: string;
  signatureLabel: string;
  sharePrompt: string;
  names: string;
  accent: string;
  template?: ArtifactTemplate;
};

export async function buildShareCard(options: ShareCardOptions): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }

  const template = options.template ?? "cosmic";
  const gradient = context.createLinearGradient(0, 0, 1080, 1920);
  if (template === "spotlight") {
    gradient.addColorStop(0, "#22112c");
    gradient.addColorStop(0.5, "#5b1f44");
    gradient.addColorStop(1, options.accent);
  } else if (template === "tabloid") {
    gradient.addColorStop(0, "#17131f");
    gradient.addColorStop(0.42, "#3f1d32");
    gradient.addColorStop(1, options.accent);
  } else if (template === "headline") {
    gradient.addColorStop(0, "#f8f1de");
    gradient.addColorStop(0.48, "#eadfca");
    gradient.addColorStop(1, "#d2c0a0");
  } else if (template === "portrait") {
    gradient.addColorStop(0, "#1d2336");
    gradient.addColorStop(0.45, "#4f355d");
    gradient.addColorStop(1, options.accent);
  } else if (template === "storybook") {
    gradient.addColorStop(0, "#311d24");
    gradient.addColorStop(0.5, "#6d3c4f");
    gradient.addColorStop(1, "#ba7f52");
  } else {
    gradient.addColorStop(0, "#0f1630");
    gradient.addColorStop(0.55, "#1f2e63");
    gradient.addColorStop(1, options.accent);
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (template === "spotlight") {
    context.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(context, 790, 90, 170, 430, 90);
    context.fill();
  } else if (template === "tabloid") {
    context.fillStyle = "rgba(255,255,255,0.06)";
    context.fillRect(92, 116, 896, 12);
    context.fillRect(92, 144, 520, 12);
  } else if (template === "headline") {
    context.fillStyle = "rgba(32, 23, 8, 0.1)";
    context.fillRect(92, 120, 896, 18);
    context.fillRect(92, 150, 620, 10);
  } else if (template === "portrait") {
    context.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(context, 760, 110, 210, 330, 110);
    context.fill();
  } else if (template === "storybook") {
    context.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(context, 100, 96, 880, 144, 24);
    context.fill();
  } else {
    context.fillStyle = "rgba(255,255,255,0.06)";
    context.beginPath();
    context.arc(860, 250, 180, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = template === "headline" ? "#201708" : "#f8f4e8";
  context.font = "bold 66px Georgia";
  context.fillText(options.brandLabel, 90, 160);

  context.font = "32px Georgia";
  context.fillStyle = template === "headline" ? "#7f4d1d" : "#ffd166";
  context.fillText(options.names, 90, 240);

  context.font = "bold 34px Georgia";
  context.fillStyle = template === "headline" ? "#8c2410" : options.accent;
  context.fillText(options.hook.toUpperCase(), 90, 296);

  context.fillStyle =
    template === "headline"
      ? "rgba(255, 251, 242, 0.82)"
      : template === "tabloid"
        ? "rgba(18, 12, 24, 0.78)"
        : template === "storybook"
          ? "rgba(34, 20, 25, 0.72)"
          : "rgba(9, 13, 28, 0.72)";
  roundRect(context, 72, 330, 936, 1030, template === "spotlight" ? 28 : 42);
  context.fill();

  context.fillStyle = template === "headline" ? "rgba(32, 23, 8, 0.12)" : "rgba(255,255,255,0.1)";
  context.font = "bold 28px Georgia";
  context.fillText(options.testLabel.toUpperCase(), 110, 392);

  context.fillStyle = template === "headline" ? "#8c2410" : options.accent;
  context.font = "bold 144px Georgia";
  context.fillText(options.score, 110, 560);

  context.fillStyle = template === "headline" ? "#201708" : "#f8f4e8";
  context.font = "bold 84px Georgia";
  wrapText(context, options.title, 110, 700, 820, 94);

  context.font = "40px Georgia";
  wrapText(context, options.body, 110, 900, 840, 58);

  context.fillStyle = template === "headline" ? "#6f5b40" : "#b7d7ff";
  context.font = "italic 34px Georgia";
  wrapText(context, options.insight, 110, 1190, 820, 48);

  context.fillStyle = template === "headline" ? "#8c2410" : "#ffd166";
  context.font = "bold 34px Georgia";
  context.fillText(`${options.signatureLabel}: ${options.signature}`, 110, 1410);

  context.fillStyle = template === "headline" ? "rgba(32, 23, 8, 0.12)" : "rgba(255,255,255,0.12)";
  roundRect(context, 72, 1560, 936, 200, template === "tabloid" ? 20 : 36);
  context.fill();
  context.fillStyle = template === "headline" ? "#201708" : "#f8f4e8";
  context.font = "32px Georgia";
  wrapText(context, options.sharePrompt, 110, 1640, 840, 46);

  return canvas.toDataURL("image/png");
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = text.split(" ");
  let line = "";

  for (const word of words) {
    const next = `${line}${word} `;
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line.trim(), x, y);
      line = `${word} `;
      y += lineHeight;
      continue;
    }

    line = next;
  }

  if (line) {
    context.fillText(line.trim(), x, y);
  }
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}
