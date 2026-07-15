import { neon } from '@neondatabase/serverless'
import { Pool, type QueryResultRow } from 'pg'

const connectionString = process.env.NEON_CONNECTION_STRING

if (!connectionString) {
  throw new Error('NEON_CONNECTION_STRING environment variable is not set')
}

type SqlValue = unknown

interface QueryData {
  strings: readonly string[]
  values: SqlValue[]
}

interface SqlFragmentLike {
  queryData?: QueryData
}

function isLocalPostgres(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.endsWith('.local')
    )
  } catch {
    return /@localhost[:/]|@127\.0\.0\.1[:/]/.test(url)
  }
}

function isSqlFragment(value: SqlValue): value is SqlFragmentLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'queryData' in value &&
    typeof (value as SqlFragmentLike).queryData === 'object' &&
    (value as SqlFragmentLike).queryData !== null
  )
}

function buildPgQuery(
  strings: readonly string[],
  values: SqlValue[],
  startIndex = 0,
): { text: string; params: unknown[] } {
  let text = ''
  const params: unknown[] = []

  for (let i = 0; i < strings.length; i++) {
    text += strings[i]
    if (i >= values.length) continue

    const value = values[i]
    if (isSqlFragment(value) && value.queryData) {
      const nested = buildPgQuery(
        value.queryData.strings,
        value.queryData.values,
        startIndex + params.length,
      )
      text += nested.text
      params.push(...nested.params)
    } else {
      params.push(value)
      text += `$${startIndex + params.length}`
    }
  }

  return { text, params }
}

type SqlFn = {
  <T extends QueryResultRow = QueryResultRow>(
    strings: TemplateStringsArray,
    ...values: SqlValue[]
  ): Promise<T[]> & SqlFragmentLike
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ) => Promise<T[]>
}

/** Lazy thenable like NeonQueryPromise — only hits the DB when awaited. */
function createLocalQueryPromise<T extends QueryResultRow>(
  pool: Pool,
  queryData: QueryData,
): Promise<T[]> & SqlFragmentLike {
  let cached: Promise<T[]> | null = null

  const run = (): Promise<T[]> => {
    if (!cached) {
      cached = (async () => {
        const { text, params } = buildPgQuery(queryData.strings, queryData.values)
        const result = await pool.query<T>(text, params)
        return result.rows
      })()
    }
    return cached
  }

  const thenable = {
    queryData,
    then<TResult1 = T[], TResult2 = never>(
      onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      return run().then(onfulfilled, onrejected)
    },
    catch<TResult = never>(
      onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
    ) {
      return run().catch(onrejected)
    },
    finally(onfinally?: (() => void) | null) {
      return run().finally(onfinally ?? undefined)
    },
  }

  return thenable as Promise<T[]> & SqlFragmentLike
}

function createLocalSql(pool: Pool): SqlFn {
  const sql = ((strings: TemplateStringsArray, ...values: SqlValue[]) => {
    const queryData: QueryData = { strings: [...strings], values }
    return createLocalQueryPromise(pool, queryData)
  }) as SqlFn

  sql.query = async <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ) => {
    const result = await pool.query<T>(text, params)
    return result.rows
  }

  return sql
}

function createNeonSql(url: string): SqlFn {
  const neonSql = neon(url)

  const sql = ((strings: TemplateStringsArray, ...values: SqlValue[]) => {
    return (neonSql as Function)(strings, ...values)
  }) as SqlFn

  sql.query = async <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ) => {
    const anySql = neonSql as unknown as {
      query?: (text: string, params?: unknown[]) => Promise<T[]>
    }
    if (typeof anySql.query === 'function') {
      return anySql.query(text, params)
    }
    const result = await (neonSql as Function)(
      Object.assign([text], { raw: [text] }) as TemplateStringsArray,
      ...params,
    )
    return result as T[]
  }

  return sql
}

export const sql: SqlFn = isLocalPostgres(connectionString)
  ? createLocalSql(
      new Pool({
        connectionString,
        ssl: false,
      }),
    )
  : createNeonSql(connectionString)
