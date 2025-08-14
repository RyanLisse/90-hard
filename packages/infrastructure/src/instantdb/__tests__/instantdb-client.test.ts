import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DayLog } from "../../../../domain/src/types";
import { InstantDBClient } from "../instantdb-client";

// Mock browser APIs
global.WebSocket = vi.fn();
global.indexedDB = {} as any;

// Mock InstantDB
vi.mock("@instantdb/react", () => ({
  init: vi.fn(),
}));

describe("InstantDBClient", () => {
  let client: InstantDBClient;
  let mockDb: any;
  let mockAuth: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.VITE_INSTANTDB_APP_ID = "test-app-id";

    // Get the mock from the module
    const { init } = await import("@instantdb/react");
    const mockInit = vi.mocked(init);

    // Setup mock return value
    mockDb = {
      transact: vi.fn(),
      tx: {},
    };

    mockAuth = {
      createMagicCode: vi.fn(),
      signInWithMagicCode: vi.fn(),
      signOut: vi.fn(),
    };

    mockInit.mockReturnValue({
      db: mockDb,
      auth: mockAuth,
    });
  });

  describe("initialization", () => {
    it("should throw if VITE_INSTANTDB_APP_ID is not set", () => {
      delete process.env.VITE_INSTANTDB_APP_ID;
      expect(() => new InstantDBClient()).toThrow(
        "VITE_INSTANTDB_APP_ID is required",
      );
    });

    it("should initialize with app ID from environment", async () => {
      // Get the mock from the module
      const { init } = await import("@instantdb/react");
      const mockInit = vi.mocked(init);
      
      // Create client which should call init with the app ID
      client = new InstantDBClient();

      expect(mockInit).toHaveBeenCalledWith({
        appId: "test-app-id",
      });
    });
  });

  describe("authentication", () => {
    beforeEach(() => {
      client = new InstantDBClient();
    });

    it("should send magic code to email", async () => {
      const mockAuth = client["client"].auth;
      mockAuth.createMagicCode.mockResolvedValue({ sent: true });

      await client.sendMagicCode("user@example.com");

      expect(mockAuth.createMagicCode).toHaveBeenCalledWith({
        email: "user@example.com",
      });
    });

    it("should sign in with magic code", async () => {
      const mockAuth = client["client"].auth;
      mockAuth.signInWithMagicCode.mockResolvedValue({
        user: { id: "123", email: "user@example.com" },
      });

      const result = await client.signInWithMagicCode(
        "user@example.com",
        "123456",
      );

      expect(mockAuth.signInWithMagicCode).toHaveBeenCalledWith({
        email: "user@example.com",
        code: "123456",
      });
      expect(result.user).toEqual({ id: "123", email: "user@example.com" });
    });

    it("should sign out", async () => {
      const mockAuth = client["client"].auth;
      mockAuth.signOut.mockResolvedValue(undefined);

      await client.signOut();

      expect(mockAuth.signOut).toHaveBeenCalled();
    });
  });

  describe("transactional operations", () => {
    beforeEach(() => {
      client = new InstantDBClient();
    });

    it("should create a day log", async () => {
      const dayLog: Omit<DayLog, "id" | "createdAt" | "updatedAt"> = {
        userId: "user123",
        date: "2024-03-27",
        tasks: {
          workout1: true,
          workout2: false,
          diet: true,
          water: true,
          reading: false,
          photo: false,
        },
        weightKg: 75.5,
        fastingHours: 16,
      };

      mockDb.transact.mockResolvedValue({ id: "daylog123" });

      await client.createDayLog(dayLog);

      expect(mockDb.transact).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            __op: "create",
            __entity: "daylogs",
            data: expect.objectContaining({
              ...dayLog,
              id: expect.any(String),
              createdAt: expect.any(Number),
              updatedAt: expect.any(Number),
            }),
          }),
        ]),
      );
    });

    it("should update a day log", async () => {
      const updates = {
        tasks: {
          workout1: true,
          workout2: true,
          diet: true,
          water: true,
          reading: true,
          photo: true,
        },
      };

      mockDb.transact.mockResolvedValue({ success: true });

      await client.updateDayLog("daylog123", updates);

      expect(mockDb.transact).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            __op: "update",
            __entity: "daylogs",
            id: "daylog123",
            data: expect.objectContaining({
              ...updates,
              updatedAt: expect.any(Number),
            }),
          }),
        ]),
      );
    });

    it("should batch create multiple entities", async () => {
      const operations = [
        {
          type: "create" as const,
          entity: "users" as const,
          data: { email: "test@example.com", name: "Test User" },
        },
        {
          type: "update" as const,
          entity: "daylogs" as const,
          id: "daylog123",
          data: { weightKg: 76 },
        },
      ];

      mockDb.transact.mockResolvedValue({ success: true });

      await client.batchTransact(operations);

      expect(mockDb.transact).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            __op: "create",
            __entity: "users",
            data: expect.objectContaining({
              email: "test@example.com",
              name: "Test User",
              id: expect.any(String),
              createdAt: expect.any(Number),
              updatedAt: expect.any(Number),
            }),
          }),
          expect.objectContaining({
            __op: "update",
            __entity: "daylogs",
            id: "daylog123",
            data: expect.objectContaining({
              weightKg: 76,
              updatedAt: expect.any(Number),
            }),
          }),
        ]),
      );
    });
  });
});
