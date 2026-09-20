import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { H3Event } from 'h3'
import { getDb, type User } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'daily-routine-secure-jwt-key-2026-secret'
const COOKIE_NAME = 'auth_token'

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function generateToken(user: { id: number; username: string }): string {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}

export function verifyToken(token: string): { id: number; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string }
  } catch {
    return null
  }
}

export function setAuthCookie(event: H3Event, token: string) {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/'
  })
}

export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function getAuthUser(event: H3Event): User | null {
  let token = getCookie(event, COOKIE_NAME)
  if (!token) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  const db = getDb()
  const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(payload.id) as User | undefined
  return user || null
}

export function requireAuth(event: H3Event): User {
  const user = getAuthUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please login first'
    })
  }
  return user
}
