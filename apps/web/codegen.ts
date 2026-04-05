import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './schema.graphql',
  documents: ['src/graphql/operations/**/*.graphql'],
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        avoidOptionals: true,
        enumsAsTypes: true,
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
}

export default config
