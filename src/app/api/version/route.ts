import { NextResponse } from 'next/server'

// VERCEL_GIT_COMMIT_SHA is set automatically on every Vercel deployment
const BUILD_ID = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_BUILD_ID ?? 'dev'

export function GET() {
  return NextResponse.json(
    { version: BUILD_ID },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
