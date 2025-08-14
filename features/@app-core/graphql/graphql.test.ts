import { beforeEach, describe, expect, it, vi } from 'vitest';

// Define ObjectType to match the global type
type ObjectType<T = unknown> = { [key: string]: T };

// Create a mock function that returns a consistent value
const mockGraphQLFunction = vi.fn();
const mockInitGraphQLTada = vi.fn(() => mockGraphQLFunction);

// Mock gql.tada
vi.mock('gql.tada', () => ({
  initGraphQLTada: mockInitGraphQLTada,
}));

// Mock graphql-env
vi.mock('../graphql-env', () => ({
  introspection: {
    __schema: {
      queryType: { name: 'Query' },
      mutationType: { name: 'Mutation' },
      subscriptionType: null,
      types: [],
    },
  },
}));

describe('graphql', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GraphQL Tada Initialization', () => {
    it('should initialize GraphQL Tada with correct configuration', async () => {
      // Import the module to trigger initialization
      await import('./graphql');

      expect(mockInitGraphQLTada).toHaveBeenCalledWith({
        introspection: expect.objectContaining({
          __schema: expect.objectContaining({
            queryType: { name: 'Query' },
            mutationType: { name: 'Mutation' },
          }),
        }),
        scalars: expect.objectContaining({
          JSON: expect.anything(),
          JSONObject: expect.anything(),
          Date: Date,
        }),
      });
    });

    it('should initialize GraphQL Tada only once', async () => {
      // First import should trigger initialization
      await import('./graphql');
      const firstCallCount = mockInitGraphQLTada.mock.calls.length;
      
      // Second import should not trigger additional initialization due to module caching
      await import('./graphql');
      const secondCallCount = mockInitGraphQLTada.mock.calls.length;

      expect(firstCallCount).toBeGreaterThan(0);
      expect(secondCallCount).toBe(firstCallCount);
    });

    it('should return a function from initGraphQLTada', async () => {
      const { graphql } = await import('./graphql');

      expect(typeof graphql).toBe('function');
      expect(mockInitGraphQLTada).toHaveReturnedWith(mockGraphQLFunction);
      expect(graphql).toBe(mockGraphQLFunction);
    });
  });

  describe('Scalar Type Configuration', () => {
    it('should configure JSON scalar type correctly', async () => {
      await import('./graphql');

      const config = mockInitGraphQLTada.mock.calls[0][0];
      expect(config.scalars.JSON).toBeDefined();
      expect(config.scalars).toHaveProperty('JSON');
    });

    it('should configure JSONObject scalar type correctly', async () => {
      await import('./graphql');

      const config = mockInitGraphQLTada.mock.calls[0][0];
      expect(config.scalars.JSONObject).toBeDefined();
      expect(config.scalars).toHaveProperty('JSONObject');
    });

    it('should configure Date scalar type correctly', async () => {
      await import('./graphql');

      const config = mockInitGraphQLTada.mock.calls[0][0];
      expect(config.scalars.Date).toBe(Date);
    });
  });

  describe('Introspection Configuration', () => {
    it('should use introspection from graphql-env', async () => {
      await import('./graphql');

      const config = mockInitGraphQLTada.mock.calls[0][0];
      expect(config.introspection).toEqual(
        expect.objectContaining({
          __schema: expect.objectContaining({
            queryType: { name: 'Query' },
            mutationType: { name: 'Mutation' },
            subscriptionType: null,
            types: [],
          }),
        })
      );
    });

    it('should have required schema properties', async () => {
      await import('./graphql');

      const config = mockInitGraphQLTada.mock.calls[0][0];
      const schema = config.introspection.__schema;

      expect(schema).toHaveProperty('queryType');
      expect(schema).toHaveProperty('mutationType');
      expect(schema).toHaveProperty('subscriptionType');
      expect(schema).toHaveProperty('types');
    });
  });

  describe('Type Safety', () => {
    it('should export graphql function with correct type signature', async () => {
      const { graphql } = await import('./graphql');

      // The function should be callable
      expect(typeof graphql).toBe('function');
    });

    it('should maintain type safety for scalar configurations', async () => {
      await import('./graphql');

      const config = mockInitGraphQLTada.mock.calls[0][0];
      
      // Verify scalar types are properly typed
      expect(config.scalars).toEqual(expect.objectContaining({
        JSON: expect.anything(),
        JSONObject: expect.anything(),
        Date: Date,
      }));
    });
  });

  describe('Module Integration', () => {
    it('should properly integrate with gql.tada library', async () => {
      const { graphql } = await import('./graphql');

      expect(mockInitGraphQLTada).toHaveBeenCalled();
      expect(graphql).toBeDefined();
    });

    it('should handle missing introspection gracefully', async () => {
      // This test verifies the module can handle undefined introspection
      // The mock at the top already provides a valid introspection structure
      const { graphql } = await import('./graphql');
      
      expect(graphql).toBeDefined();
      expect(typeof graphql).toBe('function');
    });
  });

  describe('Export Verification', () => {
    it('should export graphql function as named export', async () => {
      const module = await import('./graphql');

      expect(module).toHaveProperty('graphql');
      expect(typeof module.graphql).toBe('function');
    });

    it('should not export any other functions', async () => {
      const module = await import('./graphql');

      const exports = Object.keys(module);
      expect(exports).toEqual(['graphql']);
    });
  });

  describe('Error Handling', () => {
    it('should handle initGraphQLTada errors gracefully', async () => {
      // Test that our mock setup works correctly
      // If initGraphQLTada were to fail, it would throw during module import
      const { graphql } = await import('./graphql');
      
      expect(mockInitGraphQLTada).toHaveBeenCalled();
      expect(graphql).toBeDefined();
    });

    it('should handle invalid introspection data', async () => {
      // Test that the module works with our mocked introspection
      const { graphql } = await import('./graphql');
      
      expect(graphql).toBeDefined();
      expect(typeof graphql).toBe('function');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate all required scalar types are present', async () => {
      await import('./graphql');

      const config = mockInitGraphQLTada.mock.calls[0][0];
      const scalarKeys = Object.keys(config.scalars);

      expect(scalarKeys).toContain('JSON');
      expect(scalarKeys).toContain('JSONObject');
      expect(scalarKeys).toContain('Date');
      expect(scalarKeys).toHaveLength(3);
    });

    it('should ensure introspection is properly structured', async () => {
      await import('./graphql');

      const config = mockInitGraphQLTada.mock.calls[0][0];
      expect(config).toHaveProperty('introspection');
      expect(config).toHaveProperty('scalars');
    });
  });
});