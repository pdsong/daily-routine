import type { H3Event } from 'h3'
import { getDb } from './db'

export interface IpAttempt {
  ip: string
  failed_attempts: number
  penalty_level: number
  blocked_until: number // timestamp in ms
  last_failed_at: number // timestamp in ms
}

/**
 * 严谨获取客户端真实 IP（兼容反向代理与 CDN）
 */
export function getClientIp(event: H3Event): string {
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',')
    if (ips.length > 0 && ips[0].trim()) {
      return ips[0].trim()
    }
  }

  const xRealIp = getHeader(event, 'x-real-ip')
  if (xRealIp) {
    return xRealIp.trim()
  }

  const cfConnectingIp = getHeader(event, 'cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }

  return (
    event.node?.req?.socket?.remoteAddress ||
    event.node?.req?.connection?.remoteAddress ||
    '127.0.0.1'
  )
}

/**
 * 检查当前 IP 是否处于 404 封禁惩罚期
 * 如果在封禁期内该 IP 仍然高频撞门尝试（超过 10 次），将自动升级惩罚等级（10m -> 100m -> 1000m...）
 */
export function checkLoginIpBlocked(event: H3Event): void {
  const ip = getClientIp(event)
  const db = getDb()
  const now = Date.now()

  const record = db
    .prepare('SELECT * FROM login_attempts WHERE ip = ?')
    .get(ip) as IpAttempt | undefined

  if (!record) {
    return
  }

  // 处于封禁期内
  if (record.blocked_until && record.blocked_until > now) {
    // 记录在封禁期内的违规撞门次数
    const newAttempts = record.failed_attempts + 1
    
    // 如果在封禁期内又狂打了 10 次以上，直接升级封禁阶梯
    if (newAttempts >= 10) {
      const nextLevel = Math.min(record.penalty_level + 1, 5) // 最高 5 级 (10^5 = 100000 分钟)
      const penaltyMinutes = Math.pow(10, nextLevel)
      const newBlockedUntil = now + penaltyMinutes * 60 * 1000

      db.prepare(`
        UPDATE login_attempts
        SET failed_attempts = 0,
            penalty_level = ?,
            blocked_until = ?,
            last_failed_at = ?
        WHERE ip = ?
      `).run(nextLevel, newBlockedUntil, now, ip)
    } else {
      db.prepare(`
        UPDATE login_attempts
        SET failed_attempts = ?,
            last_failed_at = ?
        WHERE ip = ?
      `).run(newAttempts, now, ip)
    }

    // 伪装 404 Not Found
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found'
    })
  }
}

/**
 * 登录失败时调用：累加错误次数并在超过 10 次时触发指数惩罚
 */
export function recordLoginFailure(event: H3Event): void {
  const ip = getClientIp(event)
  const db = getDb()
  const now = Date.now()
  const WINDOW_MS = 10 * 60 * 1000 // 10分钟窗口

  const record = db
    .prepare('SELECT * FROM login_attempts WHERE ip = ?')
    .get(ip) as IpAttempt | undefined

  if (!record) {
    db.prepare(`
      INSERT INTO login_attempts (ip, failed_attempts, penalty_level, blocked_until, last_failed_at)
      VALUES (?, 1, 0, 0, ?)
    `).run(ip, now)
    return
  }

  let attempts = record.failed_attempts
  let penaltyLevel = record.penalty_level

  // 如果距离上一次输错已经超过 10 分钟且之前没有被封禁，重置窗口计数
  if (now - record.last_failed_at > WINDOW_MS && record.blocked_until <= now) {
    attempts = 0
  }

  attempts += 1

  // 10 分钟内输错达到或超过 10 次
  if (attempts >= 10) {
    // 提升惩罚等级：第一次是 1 (10^1 = 10分钟)，第二次违规是 2 (10^2 = 100分钟)，以此类推
    const nextLevel = Math.max(penaltyLevel + 1, 1)
    const cappedLevel = Math.min(nextLevel, 5) // 封顶上限
    const penaltyMinutes = Math.pow(10, cappedLevel)
    const blockedUntil = now + penaltyMinutes * 60 * 1000

    db.prepare(`
      UPDATE login_attempts
      SET failed_attempts = 0,
          penalty_level = ?,
          blocked_until = ?,
          last_failed_at = ?
      WHERE ip = ?
    `).run(cappedLevel, blockedUntil, now, ip)

    // 立即以 404 伪装截断该请求
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found'
    })
  } else {
    db.prepare(`
      UPDATE login_attempts
      SET failed_attempts = ?,
          last_failed_at = ?
      WHERE ip = ?
    `).run(attempts, now, ip)
  }
}

/**
 * 登录成功时调用：立即中断并清空该 IP 的全部错误惩罚记录
 */
export function recordLoginSuccess(event: H3Event): void {
  const ip = getClientIp(event)
  const db = getDb()
  db.prepare('DELETE FROM login_attempts WHERE ip = ?').run(ip)
}
