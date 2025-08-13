import {
  graphql,
  type ResultOf,
  type TadaDocumentNode,
  type VariablesOf,
} from 'gql.tada';
import { print } from 'graphql';
import { lowercaseFirstChar } from '../utils/stringUtils';
import { type Meta$Schema, type Metadata, z } from './index';

/* --- Constants ------------------------------------------------------------------------------- */

const INPUT_INDICATORS = ['Input', 'Args', 'Arguments'] as const;

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'GRAPHQL'] as const;

/* --- Types ----------------------------------------------------------------------------------- */

export type INPUT_INDICATORS = (typeof INPUT_INDICATORS)[number];

export type ALLOWED_METHODS = (typeof ALLOWED_METHODS)[number];

/** --- normalizeSchemaName() ------------------------------------------------------------------ */
/** -i- Appends schema name with 'Input', but only if there isn't already an indicator of input in there */
export const normalizeSchemaName = (
  schemaName: string,
  prefix: 'type' | 'input'
) => {
  const isInputSchemaName = INPUT_INDICATORS.some((term) =>
    schemaName?.includes(term)
  );
  if (prefix === 'input' && !isInputSchemaName) {
    return `${schemaName}Input`;
  }
  if (prefix === 'type' && isInputSchemaName) {
    return `${schemaName}Type`;
  }
  return schemaName;
};

/** --- renderGraphqlQuery() ------------------------------------------------------------------- */
/** -i- Accepts a resolverName, inputSchema and outputSchema and spits out a graphql query that stops at 3 levels (or a custom number) of depth */
export const renderGraphqlQuery = <
  ArgsShape extends z.ZodRawShape,
  ResShape extends z.ZodRawShape,
>({
  resolverName,
  resolverArgsName,
  resolverType,
  inputSchema,
  outputSchema,
  maxFieldDepth = 5,
  logWarnings = true,
}: {
  resolverName: string;
  resolverArgsName: string;
  resolverType: 'query' | 'mutation';
  inputSchema: z.ZodObject<ArgsShape>;
  outputSchema: z.ZodObject<ResShape>;
  maxFieldDepth?: number;
  logWarnings?: boolean;
}) => {
  // Introspect input & output schemas
  const argsSchemaDefs = inputSchema.introspect();
  const responseSchemaDefs = outputSchema.introspect();
  let argsInputName = normalizeSchemaName(argsSchemaDefs.name!, 'input');
  const _resolverArgsName = lowercaseFirstChar(resolverArgsName);

  // Determine nullability of args
  const isRequired = !(argsSchemaDefs.isNullable || argsSchemaDefs.isOptional);
  if (isRequired) {
    argsInputName = `${argsInputName}!`;
  }

  // Build query base
  let query = `${resolverType} ${resolverName}($${_resolverArgsName}: ${argsInputName}) {\n    {{body}}\n}`; // prettier-ignore
  query = query.replace(
    '{{body}}',
    `${resolverName}(args: $${_resolverArgsName}) {\n{{fields}}\n    }`
  ); // prettier-ignore

  // Re-evaluate query setup if there are no args
  // @ts-expect-error
  const hasArgs = Object.keys(argsSchemaDefs.schema).length > 0;
  if (!hasArgs) {
    query = `${resolverType} ${resolverName} {\n  {{body}}\n}`;
    query = query.replace('{{body}}', `${resolverName} {\n{{fields}}\n    }`);
  }

  // Nestable field builder
  const renderFields = (
    schema: Meta$Schema,
    depth: number,
    _fieldName?: string
  ) => {
    try {
      const fieldKeys = Object.keys(schema.schema || schema);
      const fieldEntries = fieldKeys.map((fieldKey): string => {
        // @ts-expect-error
        const fieldConfig = (schema.schema?.[fieldKey] ||
          schema[fieldKey]) as Metadata;
        const zodType = fieldConfig.zodType;
        const fieldType = fieldConfig.baseType;
        const spacing = '    '.repeat(depth);

        // Skip sensitive fields
        if (fieldConfig.isSensitive) {
          return '';
        }

        // Skip incompatible types
        const INCOMPATIBLES = [
          'ZodRecord',
          'ZodIntersection',
          'ZodDiscriminatedUnion',
          'ZodVoid',
          'ZodFunction',
          'ZodPromise',
          'ZodLazy',
          'ZodEffects',
        ] as const; // prettier-ignore
        if (logWarnings && INCOMPATIBLES.includes(zodType as any)) {
          return '';
        }

        // Render fields with no nesting
        const UNNESTABLES = [
          'ZodString',
          'ZodNumber',
          'ZodBoolean',
          'ZodDate',
          'ZodLiteral',
          'ZodEnum',
          'ZodNativeEnum',
        ] as const;
        if (UNNESTABLES.includes(zodType as any)) {
          return `${spacing}${fieldKey}`;
        }

        // Handle regular arrays and tuples
        const isArray = fieldType === 'Array';
        const isNonObjectLike = !['Object', 'Array'].includes(fieldType); // @ts-ignore
        const isNonObjectArray =
          isArray &&
          !['Object', 'Array'].includes(fieldConfig.schema?.baseType); // prettier-ignore
        const hasNoSubFields = isNonObjectLike || isNonObjectArray;
        if (hasNoSubFields) {
          return `${spacing}${fieldKey}`;
        }

        // Stop a max depth
        if (depth >= maxFieldDepth) {
          return `${spacing}${fieldKey}`;
        }

        // Handle nested types
        const objectSchema = fieldConfig.schema as Meta$Schema;
        return `${spacing}${fieldKey} {\n${renderFields(objectSchema, depth + 1, fieldKey)}\n${spacing}}`;
      });
      return fieldEntries.filter(Boolean).join('\n');
    } catch (_error) {
      return '';
    }
  };

  // Render fields into the query
  const fields = renderFields(responseSchemaDefs as Meta$Schema, 2);
  query = query.replace('{{fields}}', fields);
  return query;
};

/** --- createDataBridge() --------------------------------------------------------------------- */
/** -i- Create a reusable bridge object between a resolver and a page */
export const createDataBridge = <
  ResolverName extends string,
  ArgsShape extends z.ZodRawShape,
  ResShape extends z.ZodRawShape,
  CustomQuery extends TadaDocumentNode | null = null,
  ResolverArgsName extends
    | `${ResolverName}Args`
    | HintedKeys = `${ResolverName}Args`,
  DefaultQueryArgs = PrettifySingleKeyRecord<
    Record<
      LowercaseFirstChar<ResolverArgsName>,
      z.ZodObject<ArgsShape>['_input']
    >
  >,
  DefaultQueryRes = PrettifySingleKeyRecord<
    Record<ResolverName, z.ZodObject<ResShape>['_output']>
  >,
  QueryArgs = CustomQuery extends null
    ? DefaultQueryArgs
    : VariablesOf<CustomQuery>,
  QueryRes = CustomQuery extends null ? DefaultQueryRes : ResultOf<CustomQuery>,
>({
  resolverName,
  resolverType: customResolverType,
  resolverArgsName = `${resolverName}Args`,
  inputSchema,
  outputSchema,
  apiPath,
  allowedMethods,
  graphqlQuery,
  ...restOptions
}: {
  resolverName: ResolverName;
  resolverType?: 'query' | 'mutation';
  resolverArgsName?: ResolverArgsName | HintedKeys;
  inputSchema: z.ZodObject<ArgsShape>;
  outputSchema: z.ZodObject<ResShape>;
  apiPath?: string;
  allowedMethods?: ALLOWED_METHODS[];
  graphqlQuery?: CustomQuery;
  isMutation?: boolean;
}) => {
  // Vars & Flags
  const printedQuery = graphqlQuery ? print(graphqlQuery) : '';
  const containsMutation = printedQuery?.includes?.('mutation');
  const isMutation = restOptions.isMutation || containsMutation;
  const resolverType =
    customResolverType || (isMutation ? 'mutation' : 'query');

  // -- Error Checks --

  if (!resolverName) {
    throw new Error('createDataBridge() -!- Resolver name is required');
  }
  if (!inputSchema) {
    throw new Error('createDataBridge() -!- Args schema is required');
  }
  if (!outputSchema) {
    throw new Error('createDataBridge() -!- Response schema is required');
  }

  // -- Build default graphql query? --

  const getGraphqlQuery = (showPrintedQuery = false, logWarnings = true) => {
    // Return custom query if provided
    if (graphqlQuery && !showPrintedQuery) {
      return graphqlQuery as TadaDocumentNode<QueryRes, QueryArgs>;
    }

    // Build a default query otherwise
    const defaultGraphqlQueryString = renderGraphqlQuery({
      resolverName,
      resolverArgsName,
      resolverType,
      inputSchema,
      outputSchema,
      logWarnings,
    });

    // Return the query as a string
    if (showPrintedQuery) {
      return defaultGraphqlQueryString;
    }

    // Return the query as a TadaDocumentNode
    const gqlArgsSchema = z.object({
      [resolverName as ResolverName]: inputSchema,
    });
    const gqlResSchema = z.object({
      [resolverName as ResolverName]: outputSchema,
    });
    const documentNode = graphql(defaultGraphqlQueryString) as TadaDocumentNode<
      z.infer<typeof gqlArgsSchema>,
      z.infer<typeof gqlResSchema>
    >;
    return documentNode as TadaDocumentNode<QueryRes, QueryArgs>;
  };

  // -- Return Data Bridge --

  return {
    resolverName,
    resolverType,
    resolverArgsName,
    inputSchema,
    outputSchema,
    apiPath,
    allowedMethods,
    isMutation,
    getGraphqlQuery,
    _input: undefined as unknown as z.ZodObject<ArgsShape>['_input'],
    _output: undefined as unknown as z.ZodObject<ResShape>['_output'],
  };
};

/* --- Exported Types -------------------------------------------------------------------------- */

export type DataBridgeType = ReturnType<typeof createDataBridge>;
