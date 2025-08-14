import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
const mockMergeResolvers = vi.fn();
const mockMakeExecutableSchema = vi.fn();
const mockCreateGraphSchemaDefs = vi.fn();
const mockGql = vi.fn();
const mockGraphQLJSON = { name: 'JSON' };
const mockGraphQLJSONObject = { name: 'JSONObject' };

vi.mock('@app/registries/resolvers.generated', () => ({
  testResolver: vi.fn(),
  anotherResolver: vi.fn(),
}));

vi.mock('@graphql-tools/merge', () => ({
  mergeResolvers: mockMergeResolvers,
}));

vi.mock('@graphql-tools/schema', () => ({
  makeExecutableSchema: mockMakeExecutableSchema,
}));

vi.mock('@green-stack/schemas/createGraphSchemaDefs', () => ({
  createGraphSchemaDefs: mockCreateGraphSchemaDefs,
}));

vi.mock('graphql-tag', () => ({
  gql: mockGql,
}));

vi.mock('graphql-type-json', () => ({
  GraphQLJSON: mockGraphQLJSON,
  GraphQLJSONObject: mockGraphQLJSONObject,
}));

vi.mock('./typeDefs', () => ({
  typeDefs: 'type Query { hello: String }',
}));

describe('schema', () => {
  const mockGeneratedResolvers = {
    Query: {
      generatedQuery: vi.fn(),
    },
    Mutation: {
      generatedMutation: vi.fn(),
    },
  };

  const mockMergedResolvers = {
    Query: {
      generatedQuery: vi.fn(),
      customQuery: vi.fn(),
    },
    Mutation: {
      generatedMutation: vi.fn(),
    },
    JSON: mockGraphQLJSON,
    JSONObject: mockGraphQLJSONObject,
  };

  const mockExecutableSchema = {
    getType: vi.fn(),
    getQueryType: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock returns
    mockCreateGraphSchemaDefs.mockReturnValue({
      generatedResolvers: mockGeneratedResolvers,
    });
    
    mockMergeResolvers.mockReturnValue(mockMergedResolvers);
    mockMakeExecutableSchema.mockReturnValue(mockExecutableSchema);
    mockGql.mockImplementation((strings) => strings.join(''));
  });

  describe('ResolverFn and ResolversMap Types', () => {
    it('should export proper type definitions', async () => {
      const { ResolverFn, ResolversMap } = await import('./schema');

      // Types should be available for import
      expect(ResolverFn).toBeUndefined(); // Types are not runtime values
      expect(ResolversMap).toBeUndefined(); // Types are not runtime values
    });
  });

  describe('createRootResolver', () => {
    it('should merge custom and generated resolvers correctly', async () => {
      const { createRootResolver } = await import('./schema');

      const extraResolvers = {
        Query: {
          extraQuery: vi.fn(),
        },
      };

      const result = createRootResolver(extraResolvers);

      expect(mockMergeResolvers).toHaveBeenCalledWith([
        {}, // customResolvers (empty by default)
        extraResolvers,
        {
          JSON: mockGraphQLJSON,
          JSONObject: mockGraphQLJSONObject,
        },
      ]);

      expect(result).toBe(mockMergedResolvers);
    });

    it('should work without extra resolvers', async () => {
      const { createRootResolver } = await import('./schema');

      const result = createRootResolver();

      expect(mockMergeResolvers).toHaveBeenCalledWith([
        {}, // customResolvers
        undefined, // extraResolvers
        {
          JSON: mockGraphQLJSON,
          JSONObject: mockGraphQLJSONObject,
        },
      ]);

      expect(result).toBe(mockMergedResolvers);
    });

    it('should include custom scalar resolvers', async () => {
      const { createRootResolver } = await import('./schema');

      createRootResolver();

      const scalarResolvers = mockMergeResolvers.mock.calls[0][0][2];
      expect(scalarResolvers).toEqual({
        JSON: mockGraphQLJSON,
        JSONObject: mockGraphQLJSONObject,
      });
    });

    it('should handle empty custom resolvers', async () => {
      const { createRootResolver } = await import('./schema');

      createRootResolver({});

      expect(mockMergeResolvers).toHaveBeenCalledWith([
        {},
        {},
        {
          JSON: mockGraphQLJSON,
          JSONObject: mockGraphQLJSONObject,
        },
      ]);
    });
  });

  describe('Schema Bundle Creation', () => {
    it('should create schema bundle with correct typeDefs', async () => {
      const { schemaBundle } = await import('./schema');

      expect(mockGql).toHaveBeenCalledWith('type Query { hello: String }');
      expect(schemaBundle.typeDefs).toBe('type Query { hello: String }');
    });

    it('should create schema bundle with merged resolvers', async () => {
      const { schemaBundle } = await import('./schema');

      expect(schemaBundle.resolvers).toBe(mockMergedResolvers);
    });

    it('should include generated resolvers in schema bundle', async () => {
      await import('./schema');

      expect(mockCreateGraphSchemaDefs).toHaveBeenCalled();
      expect(mockMergeResolvers).toHaveBeenCalledWith(
        expect.arrayContaining([mockGeneratedResolvers])
      );
    });
  });

  describe('Executable Schema Creation', () => {
    it('should create executable schema from schema bundle', async () => {
      const { executableSchema } = await import('./schema');

      expect(mockMakeExecutableSchema).toHaveBeenCalledWith({
        typeDefs: 'type Query { hello: String }',
        resolvers: mockMergedResolvers,
      });

      expect(executableSchema).toBe(mockExecutableSchema);
    });

    it('should export executable schema as default export', async () => {
      const defaultExport = await import('./schema');

      expect(defaultExport.default).toBe(mockExecutableSchema);
    });
  });

  describe('Generated Resolvers Integration', () => {
    it('should process resolvers from registries', async () => {
      const mockResolvers = {
        testResolver: vi.fn(),
        anotherResolver: vi.fn(),
      };

      await import('./schema');

      expect(mockCreateGraphSchemaDefs).toHaveBeenCalledWith(
        expect.objectContaining(mockResolvers)
      );
    });

    it('should handle empty generated resolvers', async () => {
      mockCreateGraphSchemaDefs.mockReturnValueOnce({
        generatedResolvers: {},
      });

      const { schemaBundle } = await import('./schema');

      expect(schemaBundle.resolvers).toBe(mockMergedResolvers);
    });

    it('should handle missing generated resolvers', async () => {
      mockCreateGraphSchemaDefs.mockReturnValueOnce({});

      const { schemaBundle } = await import('./schema');

      expect(mockMergeResolvers).toHaveBeenCalledWith([
        {},
        undefined, // No generatedResolvers
        {
          JSON: mockGraphQLJSON,
          JSONObject: mockGraphQLJSONObject,
        },
      ]);
    });
  });

  describe('Module Exports', () => {
    it('should export all required functions and objects', async () => {
      const module = await import('./schema');

      expect(module).toHaveProperty('createRootResolver');
      expect(module).toHaveProperty('schemaBundle');
      expect(module).toHaveProperty('executableSchema');
      expect(module).toHaveProperty('default');

      expect(typeof module.createRootResolver).toBe('function');
      expect(typeof module.schemaBundle).toBe('object');
      expect(module.executableSchema).toBeDefined();
      expect(module.default).toBe(module.executableSchema);
    });

    it('should have schema bundle with correct structure', async () => {
      const { schemaBundle } = await import('./schema');

      expect(schemaBundle).toHaveProperty('typeDefs');
      expect(schemaBundle).toHaveProperty('resolvers');
      expect(typeof schemaBundle.typeDefs).toBe('string');
      expect(typeof schemaBundle.resolvers).toBe('object');
    });
  });

  describe('Error Handling', () => {
    it('should handle createGraphSchemaDefs errors', async () => {
      vi.resetModules();
      
      mockCreateGraphSchemaDefs.mockImplementationOnce(() => {
        throw new Error('Schema creation failed');
      });

      await expect(async () => {
        await import('./schema');
      }).rejects.toThrow('Schema creation failed');
    });

    it('should handle mergeResolvers errors', async () => {
      vi.resetModules();
      
      mockMergeResolvers.mockImplementationOnce(() => {
        throw new Error('Resolver merge failed');
      });

      await expect(async () => {
        await import('./schema');
      }).rejects.toThrow('Resolver merge failed');
    });

    it('should handle makeExecutableSchema errors', async () => {
      vi.resetModules();
      
      mockMakeExecutableSchema.mockImplementationOnce(() => {
        throw new Error('Executable schema creation failed');
      });

      await expect(async () => {
        await import('./schema');
      }).rejects.toThrow('Executable schema creation failed');
    });

    it('should handle missing typeDefs', async () => {
      vi.resetModules();
      
      vi.doMock('./typeDefs', () => ({
        typeDefs: undefined,
      }));

      const { schemaBundle } = await import('./schema');

      expect(mockGql).toHaveBeenCalledWith('undefined');
      expect(schemaBundle.typeDefs).toBe('undefined');
    });
  });

  describe('Scalar Type Integration', () => {
    it('should properly integrate GraphQL JSON scalars', async () => {
      const { createRootResolver } = await import('./schema');

      createRootResolver();

      const scalarResolvers = mockMergeResolvers.mock.calls[0][0][2];
      expect(scalarResolvers.JSON).toBe(mockGraphQLJSON);
      expect(scalarResolvers.JSONObject).toBe(mockGraphQLJSONObject);
    });

    it('should maintain scalar types in final resolver map', async () => {
      const { schemaBundle } = await import('./schema');

      expect(schemaBundle.resolvers.JSON).toBe(mockGraphQLJSON);
      expect(schemaBundle.resolvers.JSONObject).toBe(mockGraphQLJSONObject);
    });
  });

  describe('Custom Resolvers', () => {
    it('should support adding custom resolvers', async () => {
      const { createRootResolver } = await import('./schema');

      const customResolvers = {
        Query: {
          customQuery: vi.fn(),
        },
        Mutation: {
          customMutation: vi.fn(),
        },
      };

      createRootResolver(customResolvers);

      expect(mockMergeResolvers).toHaveBeenCalledWith([
        {}, // Built-in custom resolvers (empty by default)
        customResolvers,
        expect.any(Object), // Scalar resolvers
      ]);
    });

    it('should handle complex custom resolver structures', async () => {
      const { createRootResolver } = await import('./schema');

      const complexResolvers = {
        Query: {
          users: vi.fn(),
          user: vi.fn(),
        },
        Mutation: {
          createUser: vi.fn(),
          updateUser: vi.fn(),
          deleteUser: vi.fn(),
        },
        User: {
          posts: vi.fn(),
          comments: vi.fn(),
        },
      };

      const result = createRootResolver(complexResolvers);

      expect(mockMergeResolvers).toHaveBeenCalledWith([
        {},
        complexResolvers,
        expect.any(Object),
      ]);

      expect(result).toBe(mockMergedResolvers);
    });
  });

  describe('Performance and Memory', () => {
    it('should create executable schema only once per import', async () => {
      await import('./schema');
      await import('./schema');

      // Module should be cached, so makeExecutableSchema called only once
      expect(mockMakeExecutableSchema).toHaveBeenCalledTimes(1);
    });

    it('should reuse schema bundle across multiple accesses', async () => {
      const { schemaBundle: bundle1 } = await import('./schema');
      const { schemaBundle: bundle2 } = await import('./schema');

      expect(bundle1).toBe(bundle2);
    });
  });

  describe('Type Safety Validation', () => {
    it('should maintain type safety for resolver functions', async () => {
      const { createRootResolver } = await import('./schema');

      // Should accept properly typed resolvers
      const typedResolvers = {
        Query: {
          test: (parent: any, args: any, context: any, info: any) => 'test',
        },
      };

      expect(() => createRootResolver(typedResolvers)).not.toThrow();
    });

    it('should maintain schema bundle type consistency', async () => {
      const { schemaBundle } = await import('./schema');

      expect(schemaBundle).toMatchObject({
        typeDefs: expect.any(String),
        resolvers: expect.any(Object),
      });
    });
  });
});