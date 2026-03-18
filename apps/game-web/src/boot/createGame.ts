import Phaser from "phaser";
import { registerScenes } from "./registerScenes";

export function createGame(): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "game-root",
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.NO_CENTER
    },
    backgroundColor: "#0f1630"
  };

  registerScenes(config);
  return new Phaser.Game(config);
}
