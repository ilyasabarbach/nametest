import "./styles/main.css";
import { createGame } from "./boot/createGame";
import { installPlatformLifecycle } from "./platform/installLifecycle";

const game = createGame();
void installPlatformLifecycle(game);
