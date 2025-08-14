import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Metadata as NextMetadata } from "next/types";
import { createMetadata } from "./metadata";

// Mock the appConfig import
vi.mock("@app/config", () => ({
  appConfig: {
    title: "90-Hard Challenge",
    description: "Track your 90-day fitness challenge with photo capture, voice journaling, and analytics",
    openGraph: {
      title: "90-Hard Challenge",
      description: "Track your 90-day fitness challenge with photo capture, voice journaling, and analytics",
      url: "https://90hard.app",
      siteName: "90-Hard Challenge",
    },
  },
}));

describe("createMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("title handling", () => {
    it("should use context title when provided", () => {
      const ctx: NextMetadata = {
        title: "Custom Page Title",
      };

      const result = createMetadata(ctx);

      expect(result.title).toBe("Custom Page Title");
    });

    it("should fallback to appConfig.title when context title is not provided", () => {
      const ctx: NextMetadata = {};

      const result = createMetadata(ctx);

      expect(result.title).toBe("90-Hard Challenge");
    });

    it("should fallback to appConfig.openGraph.title when neither context nor appConfig.title exists", () => {
      const ctx: NextMetadata = {};

      // Temporarily mock appConfig without main title
      vi.doMock("@app/config", () => ({
        appConfig: {
          openGraph: {
            title: "OpenGraph Title",
            description: "OpenGraph description",
            url: "https://90hard.app",
            siteName: "90-Hard Challenge",
          },
        },
      }));

      const result = createMetadata(ctx);

      expect(result.title).toBe("OpenGraph Title");
    });

    it("should handle empty string title in context", () => {
      const ctx: NextMetadata = {
        title: "",
      };

      const result = createMetadata(ctx);

      expect(result.title).toBe("90-Hard Challenge");
    });

    it("should handle null title in context", () => {
      const ctx: NextMetadata = {
        title: null,
      };

      const result = createMetadata(ctx);

      expect(result.title).toBe("90-Hard Challenge");
    });
  });

  describe("description handling", () => {
    it("should use context description when provided", () => {
      const ctx: NextMetadata = {
        description: "Custom page description",
      };

      const result = createMetadata(ctx);

      expect(result.description).toBe("Custom page description");
    });

    it("should fallback to appConfig.description when context description is not provided", () => {
      const ctx: NextMetadata = {};

      const result = createMetadata(ctx);

      expect(result.description).toBe("Track your 90-day fitness challenge with photo capture, voice journaling, and analytics");
    });

    it("should fallback to appConfig.openGraph.description when neither exists", () => {
      const ctx: NextMetadata = {};

      // Temporarily mock appConfig without main description
      vi.doMock("@app/config", () => ({
        appConfig: {
          title: "90-Hard Challenge",
          openGraph: {
            title: "90-Hard Challenge",
            description: "OpenGraph fallback description",
            url: "https://90hard.app",
            siteName: "90-Hard Challenge",
          },
        },
      }));

      const result = createMetadata(ctx);

      expect(result.description).toBe("OpenGraph fallback description");
    });

    it("should handle empty string description in context", () => {
      const ctx: NextMetadata = {
        description: "",
      };

      const result = createMetadata(ctx);

      expect(result.description).toBe("Track your 90-day fitness challenge with photo capture, voice journaling, and analytics");
    });

    it("should handle null description in context", () => {
      const ctx: NextMetadata = {
        description: null,
      };

      const result = createMetadata(ctx);

      expect(result.description).toBe("Track your 90-day fitness challenge with photo capture, voice journaling, and analytics");
    });
  });

  describe("openGraph handling", () => {
    it("should merge context openGraph with appConfig openGraph", () => {
      const ctx: NextMetadata = {
        openGraph: {
          title: "Custom OG Title",
          type: "article",
        },
      };

      const result = createMetadata(ctx);

      expect(result.openGraph).toEqual({
        title: "Custom OG Title",
        description: "Track your 90-day fitness challenge with photo capture, voice journaling, and analytics",
        url: "https://90hard.app",
        siteName: "90-Hard Challenge",
        type: "article",
      });
    });

    it("should use appConfig openGraph when context openGraph is not provided", () => {
      const ctx: NextMetadata = {};

      const result = createMetadata(ctx);

      expect(result.openGraph).toEqual({
        title: "90-Hard Challenge",
        description: "Track your 90-day fitness challenge with photo capture, voice journaling, and analytics",
        url: "https://90hard.app",
        siteName: "90-Hard Challenge",
      });
    });

    it("should override appConfig openGraph properties with context values", () => {
      const ctx: NextMetadata = {
        openGraph: {
          title: "Override Title",
          description: "Override Description",
          url: "https://custom.domain",
          images: [{ url: "https://example.com/image.jpg" }],
        },
      };

      const result = createMetadata(ctx);

      expect(result.openGraph).toEqual({
        title: "Override Title",
        description: "Override Description",
        url: "https://custom.domain",
        siteName: "90-Hard Challenge",
        images: [{ url: "https://example.com/image.jpg" }],
      });
    });

    it("should handle empty openGraph in context", () => {
      const ctx: NextMetadata = {
        openGraph: {},
      };

      const result = createMetadata(ctx);

      expect(result.openGraph).toEqual({
        title: "90-Hard Challenge",
        description: "Track your 90-day fitness challenge with photo capture, voice journaling, and analytics",
        url: "https://90hard.app",
        siteName: "90-Hard Challenge",
      });
    });

    it("should handle partial openGraph properties", () => {
      const ctx: NextMetadata = {
        openGraph: {
          type: "website",
          locale: "en_US",
        },
      };

      const result = createMetadata(ctx);

      expect(result.openGraph).toEqual({
        title: "90-Hard Challenge",
        description: "Track your 90-day fitness challenge with photo capture, voice journaling, and analytics",
        url: "https://90hard.app",
        siteName: "90-Hard Challenge",
        type: "website",
        locale: "en_US",
      });
    });
  });

  describe("comprehensive metadata merging", () => {
    it("should merge all context properties with computed defaults", () => {
      const ctx: NextMetadata = {
        title: "Custom Title",
        description: "Custom Description",
        keywords: ["fitness", "challenge", "90-day"],
        robots: "index,follow",
        viewport: "width=device-width, initial-scale=1",
        openGraph: {
          type: "article",
          images: [
            {
              url: "https://example.com/image.jpg",
              width: 1200,
              height: 630,
              alt: "90-Hard Challenge Image",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          site: "@90hardapp",
        },
      };

      const result = createMetadata(ctx);

      expect(result).toEqual({
        title: "Custom Title",
        description: "Custom Description",
        keywords: ["fitness", "challenge", "90-day"],
        robots: "index,follow",
        viewport: "width=device-width, initial-scale=1",
        openGraph: {
          title: "90-Hard Challenge",
          description: "Track your 90-day fitness challenge with photo capture, voice journaling, and analytics",
          url: "https://90hard.app",
          siteName: "90-Hard Challenge",
          type: "article",
          images: [
            {
              url: "https://example.com/image.jpg",
              width: 1200,
              height: 630,
              alt: "90-Hard Challenge Image",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          site: "@90hardapp",
        },
      });
    });

    it("should handle completely empty context", () => {
      const ctx: NextMetadata = {};

      const result = createMetadata(ctx);

      expect(result).toEqual({
        title: "90-Hard Challenge",
        description: "Track your 90-day fitness challenge with photo capture, voice journaling, and analytics",
        openGraph: {
          title: "90-Hard Challenge",
          description: "Track your 90-day fitness challenge with photo capture, voice journaling, and analytics",
          url: "https://90hard.app",
          siteName: "90-Hard Challenge",
        },
      });
    });

    it("should preserve context properties that aren't handled by defaults", () => {
      const ctx: NextMetadata = {
        viewport: "width=device-width, initial-scale=1",
        themeColor: "#1a1a1a",
        manifest: "/manifest.json",
        icons: {
          icon: "/favicon.ico",
          apple: "/apple-touch-icon.png",
        },
      };

      const result = createMetadata(ctx);

      expect(result.viewport).toBe("width=device-width, initial-scale=1");
      expect(result.themeColor).toBe("#1a1a1a");
      expect(result.manifest).toBe("/manifest.json");
      expect(result.icons).toEqual({
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
      });
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle undefined appConfig gracefully", () => {
      vi.doMock("@app/config", () => ({
        appConfig: undefined,
      }));

      const ctx: NextMetadata = {
        title: "Fallback Title",
      };

      const result = createMetadata(ctx);

      expect(result.title).toBe("Fallback Title");
      expect(result.description).toBeUndefined();
    });

    it("should handle missing openGraph in appConfig", () => {
      vi.doMock("@app/config", () => ({
        appConfig: {
          title: "90-Hard Challenge",
          description: "Track your challenge",
        },
      }));

      const ctx: NextMetadata = {};

      const result = createMetadata(ctx);

      expect(result.openGraph).toEqual({
        title: undefined,
        description: undefined,
        url: undefined,
        siteName: undefined,
      });
    });

    it("should handle null values in appConfig", () => {
      vi.doMock("@app/config", () => ({
        appConfig: {
          title: null,
          description: null,
          openGraph: {
            title: null,
            description: null,
            url: null,
            siteName: null,
          },
        },
      }));

      const ctx: NextMetadata = {};

      const result = createMetadata(ctx);

      expect(result.title).toBeNull();
      expect(result.description).toBeNull();
      expect(result.openGraph.title).toBeNull();
    });

    it("should handle deeply nested openGraph properties", () => {
      const ctx: NextMetadata = {
        openGraph: {
          images: [
            {
              url: "https://example.com/image1.jpg",
              width: 1200,
              height: 630,
              alt: "Image 1",
            },
            {
              url: "https://example.com/image2.jpg",
              width: 800,
              height: 600,
              alt: "Image 2",
            },
          ],
          videos: [
            {
              url: "https://example.com/video.mp4",
              width: 1920,
              height: 1080,
            },
          ],
        },
      };

      const result = createMetadata(ctx);

      expect(result.openGraph?.images).toHaveLength(2);
      expect(result.openGraph?.videos).toHaveLength(1);
      expect(result.openGraph?.images?.[0]).toEqual({
        url: "https://example.com/image1.jpg",
        width: 1200,
        height: 630,
        alt: "Image 1",
      });
    });
  });

  describe("type safety and return structure", () => {
    it("should return object with correct structure", () => {
      const ctx: NextMetadata = {
        title: "Test Title",
      };

      const result = createMetadata(ctx);

      expect(typeof result).toBe("object");
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(false);
    });

    it("should preserve all Next.js metadata fields", () => {
      const ctx: NextMetadata = {
        title: "Test Title",
        description: "Test Description",
        applicationName: "90-Hard App",
        authors: [{ name: "90-Hard Team" }],
        generator: "Next.js",
        keywords: ["fitness", "challenge"],
        referrer: "origin-when-cross-origin",
        creator: "90-Hard Team",
        publisher: "90-Hard Team",
        robots: "index,follow",
        alternates: {
          canonical: "https://90hard.app/test",
        },
      };

      const result = createMetadata(ctx);

      expect(result.applicationName).toBe("90-Hard App");
      expect(result.authors).toEqual([{ name: "90-Hard Team" }]);
      expect(result.generator).toBe("Next.js");
      expect(result.keywords).toEqual(["fitness", "challenge"]);
      expect(result.referrer).toBe("origin-when-cross-origin");
      expect(result.creator).toBe("90-Hard Team");
      expect(result.publisher).toBe("90-Hard Team");
      expect(result.robots).toBe("index,follow");
      expect(result.alternates).toEqual({
        canonical: "https://90hard.app/test",
      });
    });

    it("should handle function values in metadata", () => {
      const titleFn = () => "Dynamic Title";
      const ctx: NextMetadata = {
        title: titleFn,
      };

      const result = createMetadata(ctx);

      expect(result.title).toBe(titleFn);
    });
  });

  describe("appConfig integration scenarios", () => {
    it("should work with minimal appConfig", () => {
      vi.doMock("@app/config", () => ({
        appConfig: {
          title: "Minimal App",
        },
      }));

      const ctx: NextMetadata = {};

      const result = createMetadata(ctx);

      expect(result.title).toBe("Minimal App");
      expect(result.description).toBeUndefined();
    });

    it("should work with comprehensive appConfig", () => {
      vi.doMock("@app/config", () => ({
        appConfig: {
          title: "Comprehensive App",
          description: "Full featured app description",
          openGraph: {
            title: "OG Comprehensive App",
            description: "OG Full featured app description",
            url: "https://comprehensive.app",
            siteName: "Comprehensive App Site",
            type: "website",
            locale: "en_US",
            images: [
              {
                url: "https://comprehensive.app/og-image.jpg",
                width: 1200,
                height: 630,
              },
            ],
          },
        },
      }));

      const ctx: NextMetadata = {};

      const result = createMetadata(ctx);

      expect(result.title).toBe("Comprehensive App");
      expect(result.description).toBe("Full featured app description");
      expect(result.openGraph).toEqual({
        title: "OG Comprehensive App",
        description: "OG Full featured app description",
        url: "https://comprehensive.app",
        siteName: "Comprehensive App Site",
        type: "website",
        locale: "en_US",
        images: [
          {
            url: "https://comprehensive.app/og-image.jpg",
            width: 1200,
            height: 630,
          },
        ],
      });
    });
  });

  describe("real-world usage scenarios", () => {
    it("should handle blog post metadata", () => {
      const ctx: NextMetadata = {
        title: "How to Complete the 90-Hard Challenge",
        description: "A comprehensive guide to successfully completing your 90-day fitness challenge with tips and strategies.",
        openGraph: {
          type: "article",
          publishedTime: "2024-01-15T10:00:00Z",
          authors: ["90-Hard Team"],
          tags: ["fitness", "challenge", "health"],
        },
      };

      const result = createMetadata(ctx);

      expect(result.title).toBe("How to Complete the 90-Hard Challenge");
      expect(result.description).toBe("A comprehensive guide to successfully completing your 90-day fitness challenge with tips and strategies.");
      expect(result.openGraph?.type).toBe("article");
      expect(result.openGraph?.publishedTime).toBe("2024-01-15T10:00:00Z");
    });

    it("should handle profile page metadata", () => {
      const ctx: NextMetadata = {
        title: "John Doe - 90-Hard Progress",
        description: "Follow John's 90-day fitness challenge progress and achievements.",
        openGraph: {
          type: "profile",
          username: "johndoe90",
        },
        robots: "noindex,nofollow", // Private profile
      };

      const result = createMetadata(ctx);

      expect(result.title).toBe("John Doe - 90-Hard Progress");
      expect(result.robots).toBe("noindex,nofollow");
      expect(result.openGraph?.type).toBe("profile");
      expect(result.openGraph?.username).toBe("johndoe90");
    });

    it("should handle API documentation metadata", () => {
      const ctx: NextMetadata = {
        title: "90-Hard API Documentation",
        description: "Complete API reference for the 90-Hard Challenge platform.",
        robots: "index,follow",
        alternates: {
          canonical: "https://90hard.app/docs/api",
        },
      };

      const result = createMetadata(ctx);

      expect(result.title).toBe("90-Hard API Documentation");
      expect(result.alternates?.canonical).toBe("https://90hard.app/docs/api");
    });
  });
});