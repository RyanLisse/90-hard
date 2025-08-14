import { beforeEach, describe, expect, it, vi } from 'vitest';
import { graphqlQuery } from './graphqlQuery';
import type { QueryConfig } from './graphqlQuery.types';

// Mock dependencies
vi.mock('../appConfig', () => ({
  appConfig: {
    graphURL: 'http://localhost:3000/api/graphql',
  },
}));

vi.mock('graphql/language/printer', () => ({
  print: vi.fn((query) => `query printed: ${JSON.stringify(query)}`),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('graphqlQuery', () => {
  const mockQuery = {
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'query',
        name: { kind: 'Name', value: 'TestQuery' },
      },
    ],
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Successful Queries', () => {
    it('should execute a GraphQL query successfully', async () => {
      const mockResponse = {
        data: { user: { id: '1', name: 'John Doe' } },
        errors: null,
      };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await graphqlQuery(mockQuery);

      expect(result).toEqual(mockResponse.data);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query printed: ${JSON.stringify(mockQuery)}`,
          variables: undefined,
        }),
      });
    });

    it('should pass variables to the GraphQL query', async () => {
      const mockResponse = {
        data: { user: { id: '1', name: 'John Doe' } },
        errors: null,
      };

      const variables = { userId: '1' };
      const config: QueryConfig<any> = { variables };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await graphqlQuery(mockQuery, config);

      expect(result).toEqual(mockResponse.data);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query printed: ${JSON.stringify(mockQuery)}`,
          variables,
        }),
      });
    });

    it('should include custom headers when provided', async () => {
      const mockResponse = {
        data: { user: { id: '1', name: 'John Doe' } },
        errors: null,
      };

      const headers = { Authorization: 'Bearer token123' };
      const config: QueryConfig<any> = { headers };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      await graphqlQuery(mockQuery, config);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        },
        body: JSON.stringify({
          query: `query printed: ${JSON.stringify(mockQuery)}`,
          variables: undefined,
        }),
      });
    });

    it('should use custom GraphQL endpoint when provided', async () => {
      const mockResponse = {
        data: { user: { id: '1', name: 'John Doe' } },
        errors: null,
      };

      const customEndpoint = 'http://custom-endpoint.com/graphql';
      const config: QueryConfig<any> = { graphqlEndpoint: customEndpoint };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      await graphqlQuery(mockQuery, config);

      expect(mockFetch).toHaveBeenCalledWith(customEndpoint, expect.any(Object));
    });

    it('should handle queries without config', async () => {
      const mockResponse = {
        data: { user: { id: '1', name: 'John Doe' } },
        errors: null,
      };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await graphqlQuery(mockQuery);

      expect(result).toEqual(mockResponse.data);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query printed: ${JSON.stringify(mockQuery)}`,
          variables: undefined,
        }),
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw an error when GraphQL response contains errors', async () => {
      const mockResponse = {
        data: null,
        errors: [{ message: 'Field "nonExistentField" does not exist' }],
      };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      await expect(graphqlQuery(mockQuery)).rejects.toThrow(
        'Field "nonExistentField" does not exist'
      );
    });

    it('should throw an error when fetch fails', async () => {
      const fetchError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(fetchError);

      await expect(graphqlQuery(mockQuery)).rejects.toThrow('Network error');
    });

    it('should handle fetch response that is not ok', async () => {
      const mockResponse = {
        data: null,
        errors: [{ message: 'Internal server error' }],
      };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      await expect(graphqlQuery(mockQuery)).rejects.toThrow('Internal server error');
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      });

      await expect(graphqlQuery(mockQuery)).rejects.toThrow('Invalid JSON');
    });

    it('should handle multiple GraphQL errors', async () => {
      const mockResponse = {
        data: null,
        errors: [
          { message: 'First error' },
          { message: 'Second error' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      // Should throw the first error message
      await expect(graphqlQuery(mockQuery)).rejects.toThrow('First error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty variables object', async () => {
      const mockResponse = {
        data: { user: { id: '1', name: 'John Doe' } },
        errors: null,
      };

      const config: QueryConfig<any> = { variables: {} };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      await graphqlQuery(mockQuery, config);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query printed: ${JSON.stringify(mockQuery)}`,
          variables: {},
        }),
      });
    });

    it('should handle empty headers object', async () => {
      const mockResponse = {
        data: { user: { id: '1', name: 'John Doe' } },
        errors: null,
      };

      const config: QueryConfig<any> = { headers: {} };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      await graphqlQuery(mockQuery, config);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query printed: ${JSON.stringify(mockQuery)}`,
          variables: undefined,
        }),
      });
    });

    it('should handle null response data', async () => {
      const mockResponse = {
        data: null,
        errors: null,
      };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await graphqlQuery(mockQuery);

      expect(result).toBeNull();
    });

    it('should handle undefined response data', async () => {
      const mockResponse = {
        errors: null,
      };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await graphqlQuery(mockQuery);

      expect(result).toBeUndefined();
    });

    it('should handle complex nested query objects', async () => {
      const complexQuery = {
        kind: 'Document',
        definitions: [
          {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'ComplexQuery' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      } as any;

      const mockResponse = {
        data: { user: { id: '1', name: 'John Doe' } },
        errors: null,
      };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await graphqlQuery(complexQuery);

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Function Properties', () => {
    it('should have isUniversalQuery flag set to true', () => {
      expect(graphqlQuery.isUniversalQuery).toBe(true);
    });

    it('should be a function', () => {
      expect(typeof graphqlQuery).toBe('function');
    });
  });

  describe('Type Safety', () => {
    it('should properly type the return value', async () => {
      const mockResponse = {
        data: { user: { id: '1', name: 'John Doe' } },
        errors: null,
      };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await graphqlQuery(mockQuery);

      // TypeScript should infer the correct type based on the query
      expect(result).toEqual(mockResponse.data);
      expect(typeof result).toBe('object');
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle multiple concurrent queries', async () => {
      const mockResponse1 = {
        data: { user: { id: '1', name: 'User 1' } },
        errors: null,
      };

      const mockResponse2 = {
        data: { user: { id: '2', name: 'User 2' } },
        errors: null,
      };

      mockFetch
        .mockResolvedValueOnce({
          json: vi.fn().mockResolvedValueOnce(mockResponse1),
        })
        .mockResolvedValueOnce({
          json: vi.fn().mockResolvedValueOnce(mockResponse2),
        });

      const [result1, result2] = await Promise.all([
        graphqlQuery(mockQuery, { variables: { id: '1' } }),
        graphqlQuery(mockQuery, { variables: { id: '2' } }),
      ]);

      expect(result1).toEqual(mockResponse1.data);
      expect(result2).toEqual(mockResponse2.data);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle queries with large payloads', async () => {
      const largeVariables = {
        input: {
          users: Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `User ${i}`,
            email: `user${i}@example.com`,
          })),
        },
      };

      const mockResponse = {
        data: { createUsers: { success: true } },
        errors: null,
      };

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await graphqlQuery(mockQuery, { variables: largeVariables });

      expect(result).toEqual(mockResponse.data);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query printed: ${JSON.stringify(mockQuery)}`,
          variables: largeVariables,
        }),
      });
    });
  });
});