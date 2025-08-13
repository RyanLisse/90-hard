import { describe, expect, it } from "bun:test";
import { AvatarService } from "./avatarService";
import { buildAvatarPrompt, type AvatarPort } from "../ports/avatar";

class FakeAvatarDriver implements AvatarPort {
  async generate(): Promise<{ url: string }> {
    return { url: "https://example.com/avatar.png" };
  }
}

describe("AvatarService (London against AvatarPort)", () => {
  it("builds a prompt and delegates to driver", async () => {
    const driver = new FakeAvatarDriver();
    const svc = new AvatarService(driver);
    const input = { style: "ghibli" as const, mood: "confident" };
    const res = await svc.generateAvatar(input);
    expect(res.url).toBe("https://example.com/avatar.png");
    expect(res.prompt).toContain("studio-ghibli");
    expect(buildAvatarPrompt(input)).toBe(res.prompt);
  });
});

