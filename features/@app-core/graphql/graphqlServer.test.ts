import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

// Mock dependencies
const mockApolloServer = vi.fn();
const mockStartServerAndCreateNextHandler = vi.fn();
const mockGetHeaderContext = vi.fn();
const mockCreateRequestContext = vi.fn();

vi.mock('@apollo/server', () => ({
  ApolloServer: mockApolloServer,
}));

vi.mock('@as-integrations/next', () => ({
  startServerAndCreateNextHandler: mockStartServerAndCreateNextHandler,
}));

vi.mock('@green-stack/utils/apiUtils', () => ({
  getHeaderContext: mockGetHeaderContext,
}));

vi.mock('../middleware/createRequestContext', () => ({
  createRequestContext: mockCreateRequestContext,
}));

vi.mock('./schema', () => ({
  schemaBundle: {
    typeDefs: 'type Query { hello: String }',
    resolvers: {
      Query: {
        hello: () => 'Hello World',
      },
    },
  },
}));

describe('graphqlServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock returns
    mockApolloServer.mockImplementation(function(config) {
      this.config = config;
      return this;
    });
    
    mockStartServerAndCreateNextHandler.mockReturnValue(vi.fn());
    mockGetHeaderContext.mockReturnValue({ userId: 'test-user' });
    mockCreateRequestContext.mockResolvedValue({ user: { id: 'test-user' } });
  });

  describe('Apollo Server Initialization', () => {
    it('should create Apollo Server with correct configuration', async () => {
      const { graphqlServer } = await import('./graphqlServer');

      expect(mockApolloServer).toHaveBeenCalledWith({
        typeDefs: 'type Query { hello: String }',
        resolvers: {
          Query: {
            hello: expect.any(Function),
          },
        },
        introspection: true,
      });
    });

    it('should enable introspection', async () => {
      await import('./graphqlServer');

      const config = mockApolloServer.mock.calls[0][0];
      expect(config.introspection).toBe(true);
    });

    it('should use schema bundle from schema module', async () => {
      await import('./graphqlServer');

      const config = mockApolloServer.mock.calls[0][0];
      expect(config.typeDefs).toBe('type Query { hello: String }');
      expect(config.resolvers).toEqual({
        Query: {
          hello: expect.any(Function),
        },
      });
    });
  });

  describe('GraphQL Server Handler Creation', () => {
    it('should create GraphQL server handler', async () => {
      const { createGraphQLServerHandler } = await import('./graphqlServer');

      const handler = createGraphQLServerHandler();

      expect(mockStartServerAndCreateNextHandler).toHaveBeenCalledWith(
        expect.any(Object), // graphqlServer instance
        expect.objectContaining({
          context: expect.any(Function),
        })
      );
      expect(handler).toBeDefined();
    });

    it('should return a function from createGraphQLServerHandler', async () => {
      const { createGraphQLServerHandler } = await import('./graphqlServer');

      const handler = createGraphQLServerHandler();

      expect(typeof handler).toBe('function');
    });

    it('should call startServerAndCreateNextHandler with correct parameters', async () => {
      const { createGraphQLServerHandler, graphqlServer } = await import('./graphqlServer');

      createGraphQLServerHandler();

      expect(mockStartServerAndCreateNextHandler).toHaveBeenCalledWith(
        graphqlServer,
        expect.objectContaining({
          context: expect.any(Function),
        })
      );
    });
  });

  describe('Context Creation', () => {
    it('should create context with header context and request context', async () => {
      const { createGraphQLServerHandler } = await import('./graphqlServer');

      createGraphQLServerHandler();

      // Get the context function from the call
      const contextFn = mockStartServerAndCreateNextHandler.mock.calls[0][1].context;

      // Mock NextRequest
      const mockRequest = {
        headers: new Headers({
          'authorization': 'Bearer token123',
          'user-agent': 'test-agent',
        }),
        url: 'http://localhost:3000/api/graphql',
      } as NextRequest;

      await contextFn(mockRequest);

      expect(mockGetHeaderContext).toHaveBeenCalledWith(mockRequest);
      expect(mockCreateRequestContext).toHaveBeenCalledWith({
        req: mockRequest,
        userId: 'test-user',
      });
    });

    it('should return context from createRequestContext', async () => {
      const { createGraphQLServerHandler } = await import('./graphqlServer');

      createGraphQLServerHandler();

      const contextFn = mockStartServerAndCreateNextHandler.mock.calls[0][1].context;
      const mockRequest = {} as NextRequest;

      const expectedContext = { user: { id: 'test-user' } };
      mockCreateRequestContext.mockResolvedValueOnce(expectedContext);

      const result = await contextFn(mockRequest);

      expect(result).toEqual(expectedContext);
    });

    it('should handle context creation errors', async () => {
      const { createGraphQLServerHandler } = await import('./graphqlServer');

      createGraphQLServerHandler();

      const contextFn = mockStartServerAndCreateNextHandler.mock.calls[0][1].context;
      const mockRequest = {} as NextRequest;

      const contextError = new Error('Context creation failed');
      mockCreateRequestContext.mockRejectedValueOnce(contextError);

      await expect(contextFn(mockRequest)).rejects.toThrow('Context creation failed');
    });
  });

  describe('Module Exports', () => {
    it('should export graphqlServer', async () => {
      const module = await import('./graphqlServer');

      expect(module).toHaveProperty('graphqlServer');
      expect(module.graphqlServer).toBeDefined();
    });

    it('should export createGraphQLServerHandler', async () => {
      const module = await import('./graphqlServer');

      expect(module).toHaveProperty('createGraphQLServerHandler');
      expect(typeof module.createGraphQLServerHandler).toBe('function');
    });

    it('should have exactly two exports', async () => {
      const module = await import('./graphqlServer');

      const exports = Object.keys(module);
      expect(exports).toHaveLength(2);
      expect(exports).toContain('graphqlServer');
      expect(exports).toContain('createGraphQLServerHandler');
    });
  });

  describe('Error Handling', () => {
    it('should handle Apollo Server creation errors', async () => {
      vi.resetModules();
      
      mockApolloServer.mockImplementationOnce(() => {
        throw new Error('Apollo Server creation failed');
      });

      await expect(async () => {
        await import('./graphqlServer');
      }).rejects.toThrow('Apollo Server creation failed');
    });

    it('should handle missing schema bundle', async () => {
      vi.resetModules();
      
      vi.doMock('./schema', () => ({
        schemaBundle: undefined,
      }));

      await expect(async () => {
        await import('./graphqlServer');
      }).rejects.toThrow();
    });

    it('should handle header context errors gracefully', async () => {
      const { createGraphQLServerHandler } = await import('./graphqlServer');

      createGraphQLServerHandler();

      const contextFn = mockStartServerAndCreateNextHandler.mock.calls[0][1].context;
      const mockRequest = {} as NextRequest;

      mockGetHeaderContext.mockImplementationOnce(() => {
        throw new Error('Header context failed');
      });

      await expect(contextFn(mockRequest)).rejects.toThrow('Header context failed');
    });
  });

  describe('Integration', () => {
    it('should integrate all components correctly', async () => {
      const { createGraphQLServerHandler } = await import('./graphqlServer');

      const handler = createGraphQLServerHandler();

      // Verify all mocks were called correctly
      expect(mockApolloServer).toHaveBeenCalled();
      expect(mockStartServerAndCreateNextHandler).toHaveBeenCalled();
      expect(handler).toBeDefined();
    });

    it('should maintain consistent server instance across handler creations', async () => {
      const { createGraphQLServerHandler, graphqlServer } = await import('./graphqlServer');

      const handler1 = createGraphQLServerHandler();
      const handler2 = createGraphQLServerHandler();

      // Both handlers should use the same server instance
      expect(mockStartServerAndCreateNextHandler).toHaveBeenCalledTimes(2);
      expect(mockStartServerAndCreateNextHandler.mock.calls[0][0]).toBe(graphqlServer);
      expect(mockStartServerAndCreateNextHandler.mock.calls[1][0]).toBe(graphqlServer);
    });
  });

  describe('Type Safety', () => {
    it('should properly type the context function', async () => {
      const { createGraphQLServerHandler } = await import('./graphqlServer');

      createGraphQLServerHandler();

      const contextFn = mockStartServerAndCreateNextHandler.mock.calls[0][1].context;
      
      // Context function should accept NextRequest
      expect(typeof contextFn).toBe('function');
      expect(contextFn.length).toBe(1); // Should accept one parameter
    });

    it('should return properly typed handler', async () => {
      const { createGraphQLServerHandler } = await import('./graphqlServer');

      const handler = createGraphQLServerHandler();

      expect(typeof handler).toBe('function');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate Apollo Server configuration', async () => {
      await import('./graphqlServer');

      const config = mockApolloServer.mock.calls[0][0];
      
      expect(config).toHaveProperty('typeDefs');
      expect(config).toHaveProperty('resolvers');
      expect(config).toHaveProperty('introspection');
      
      expect(typeof config.typeDefs).toBe('string');
      expect(typeof config.resolvers).toBe('object');
      expect(typeof config.introspection).toBe('boolean');
    });

    it('should validate handler configuration', async () => {
      const { createGraphQLServerHandler } = await import('./graphqlServer');

      createGraphQLServerHandler();

      const handlerConfig = mockStartServerAndCreateNextHandler.mock.calls[0][1];
      
      expect(handlerConfig).toHaveProperty('context');
      expect(typeof handlerConfig.context).toBe('function');
    });
  });
});