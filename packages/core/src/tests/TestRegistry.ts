import type { TestDefinition } from "./TestDefinition";

export class TestRegistry {
  constructor(private readonly definitions: TestDefinition[]) {}

  getFeatured(): TestDefinition {
    return this.definitions.find((definition) => definition.featured && definition.enabled) ?? this.definitions[0];
  }

  getEnabled(): TestDefinition[] {
    return this.definitions.filter((definition) => definition.enabled);
  }

  getById(id: string): TestDefinition | undefined {
    return this.definitions.find((definition) => definition.id === id);
  }
}
