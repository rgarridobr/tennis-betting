import { neon } from '@neondatabase/serverless'

const connectionString = "postgresql://neondb_owner:npg_Wl8zjqS3LVOB@ep-dark-shadow-ah376b0v-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
export const sql = neon(connectionString)
