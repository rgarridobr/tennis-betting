import { runAtpSync } from './sync-atp-calendar-logic.ts'

runAtpSync()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
