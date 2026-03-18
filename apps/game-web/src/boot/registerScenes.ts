import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { HomeScene } from "../scenes/HomeScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { ResultScene } from "../scenes/ResultScene";
import { RewardScene } from "../scenes/RewardScene";
import { TestScene } from "../scenes/TestScene";

export function registerScenes(config: Phaser.Types.Core.GameConfig): void {
  config.scene = [BootScene, PreloadScene, HomeScene, TestScene, ResultScene, RewardScene];
}
