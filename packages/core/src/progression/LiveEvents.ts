import { seededIndex } from "../utils/random";

export type LimitedEvent = {
  id: string;
  name: string;
  theme: string;
  rewardMultiplier: number;
};

const events: LimitedEvent[] = [
  { id: "meteor-week", name: "Meteor Week", theme: "High-energy romance results get a bonus reward.", rewardMultiplier: 1.4 },
  { id: "spotlight-sunday", name: "Spotlight Sunday", theme: "Personality and fame tests are boosted today.", rewardMultiplier: 1.3 },
  { id: "lucky-eclipse", name: "Lucky Eclipse", theme: "Rare aura and destiny results feel more collectible.", rewardMultiplier: 1.5 }
];

export function getLimitedEvent(dateKey: string): LimitedEvent {
  return events[seededIndex(dateKey, events.length)] ?? events[0];
}
