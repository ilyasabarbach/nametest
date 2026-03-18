import Phaser from "phaser";

export function pulse(target: Phaser.GameObjects.Text): void {
  target.scene.tweens.add({
    targets: target,
    scale: { from: 0.98, to: 1.04 },
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
  });
}
