import { writeFileSync } from 'node:fs'
import { printSchema } from 'graphql'

import { schema } from '../src/server/graphql/schema'

const sdl = printSchema(schema)
writeFileSync('schema.graphql', sdl, 'utf-8')

console.log('Schema exported to schema.graphql')
