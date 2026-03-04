import { sql } from './lib/db'

async function run() {
    try {
        const res = await sql`
            SELECT
                conname as constraint_name,
                pg_get_constraintdef(c.oid) as constraint_definition
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'bracket_matches'
        `
        console.log('Constraints for bracket_matches:')
        console.log(JSON.stringify(res, null, 2))
    } catch (e) {
        console.error(e)
    }
}

run().catch(console.error)
