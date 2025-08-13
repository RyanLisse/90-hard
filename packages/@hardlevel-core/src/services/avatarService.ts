import type { AvatarPort, GenerateAvatarInput } from "../ports/avatar";
import { buildAvatarPrompt } from "../ports/avatar";

export interface AvatarServicePort {
  generateAvatar(input: GenerateAvatarInput): Promise<{ url: string; prompt: string }>;
}

export class AvatarService implements AvatarServicePort {
  constructor(private readonly driver: AvatarPort) {}

  async generateAvatar(input: GenerateAvatarInput): Promise<{ url: string; prompt: string }> {
    const prompt = buildAvatarPrompt(input);
    // In a real adapter, the prompt would be used to call an LLM image API.
    const { url } = await this.driver.generate(input);
    return { url, prompt };
  }
}

