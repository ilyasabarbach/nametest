type ShareCardOptions = {
  brandLabel: string;
  hook: string;
  title: string;
  score: string;
  body: string;
  insight: string;
  signature: string;
  signatureLabel: string;
  sharePrompt: string;
  names: string;
  accent: string;
};

export async function buildShareCard(options: ShareCardOptions): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }

  const gradient = context.createLinearGradient(0, 0, 1080, 1920);
  gradient.addColorStop(0, "#0f1630");
  gradient.addColorStop(0.55, "#1f2e63");
  gradient.addColorStop(1, options.accent);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255,255,255,0.06)";
  context.beginPath();
  context.arc(860, 250, 180, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#f8f4e8";
  context.font = "bold 66px Georgia";
  context.fillText(options.brandLabel, 90, 160);

  context.font = "32px Georgia";
  context.fillStyle = "#ffd166";
  context.fillText(options.names, 90, 240);

  context.font = "bold 34px Georgia";
  context.fillStyle = options.accent;
  context.fillText(options.hook.toUpperCase(), 90, 296);

  context.fillStyle = "rgba(9, 13, 28, 0.72)";
  roundRect(context, 72, 330, 936, 1030, 42);
  context.fill();

  context.fillStyle = options.accent;
  context.font = "bold 144px Georgia";
  context.fillText(options.score, 110, 530);

  context.fillStyle = "#f8f4e8";
  context.font = "bold 84px Georgia";
  wrapText(context, options.title, 110, 670, 820, 94);

  context.font = "40px Georgia";
  wrapText(context, options.body, 110, 870, 840, 58);

  context.fillStyle = "#b7d7ff";
  context.font = "italic 34px Georgia";
  wrapText(context, options.insight, 110, 1160, 820, 48);

  context.fillStyle = "#ffd166";
  context.font = "bold 34px Georgia";
  context.fillText(`${options.signatureLabel}: ${options.signature}`, 110, 1380);

  context.fillStyle = "rgba(255,255,255,0.12)";
  roundRect(context, 72, 1560, 936, 200, 36);
  context.fill();
  context.fillStyle = "#f8f4e8";
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
