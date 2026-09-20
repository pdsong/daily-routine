import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'

let dbInstance: Database.Database | null = null

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance
  }

  const dataDir = path.resolve(process.cwd(), 'server', 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = path.join(dataDir, 'routine.db')
  const db = new Database(dbPath)

  // Enable WAL mode and foreign keys for high performance and integrity
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'Calendar',
      color TEXT DEFAULT 'emerald',
      category TEXT DEFAULT 'other',
      type TEXT NOT NULL DEFAULT 'check_only',
      start_time TEXT,
      end_time TEXT,
      target_time TEXT,
      target_metric TEXT,
      target_value REAL,
      repeat_type TEXT DEFAULT 'daily',
      repeat_days TEXT DEFAULT '1,2,3,4,5,6,7',
      is_archived INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      duration_minutes INTEGER DEFAULT 0,
      pages_read INTEGER DEFAULT 0,
      book_title TEXT,
      notes TEXT,
      extra_data TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(habit_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id, is_archived, sort_order);
    CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id, date);
  `)

  dbInstance = db
  return db
}

export interface User {
  id: number
  username: string
  password_hash: string
  created_at: string
}

export interface Habit {
  id: number
  user_id: number
  title: string
  description?: string | null
  icon: string
  color: string
  category: string
  type: 'time_slot' | 'reminder_window' | 'quantified_log' | 'abstinence' | 'check_only'
  start_time?: string | null
  end_time?: string | null
  target_time?: string | null
  target_metric?: string | null
  target_value?: number | null
  repeat_type: 'daily' | 'weekdays' | 'weekends' | 'custom_days'
  repeat_days: string
  is_archived: number
  sort_order: number
  created_at: string
}

export interface HabitLog {
  id: number
  habit_id: number
  user_id: number
  date: string
  status: 'completed' | 'skipped' | 'failed' | 'pending'
  duration_minutes: number
  pages_read: number
  book_title?: string | null
  notes?: string | null
  extra_data?: string | null
  completed_at: string
}

// Seed preset initial habits for a newly registered user
export function seedDefaultHabits(userId: number) {
  const db = getDb()
  const insertStmt = db.prepare(`
    INSERT INTO habits (
      user_id, title, description, icon, color, category, type, 
      start_time, end_time, target_time, target_metric, target_value, 
      repeat_type, repeat_days, sort_order
    ) VALUES (
      @user_id, @title, @description, @icon, @color, @category, @type,
      @start_time, @end_time, @target_time, @target_metric, @target_value,
      @repeat_type, @repeat_days, @sort_order
    )
  `)

  const defaultTasks = [
    {
      user_id: userId,
      title: '英语跟读任务',
      description: '晨间专注跟读发音与口语材料 30 分钟',
      icon: 'Headphones',
      color: 'sky',
      category: 'study',
      type: 'time_slot',
      start_time: '08:00',
      end_time: '08:30',
      target_time: null,
      target_metric: 'minutes',
      target_value: 30,
      repeat_type: 'daily',
      repeat_days: '1,2,3,4,5,6,7',
      sort_order: 1
    },
    {
      user_id: userId,
      title: '晨跑运动',
      description: '每天早晨跑步健身，强健体魄',
      icon: 'Flame',
      color: 'emerald',
      category: 'fitness',
      type: 'time_slot',
      start_time: '08:30',
      end_time: '09:30',
      target_time: null,
      target_metric: 'minutes',
      target_value: 60,
      repeat_type: 'daily',
      repeat_days: '1,2,3,4,5,6,7',
      sort_order: 2
    },
    {
      user_id: userId,
      title: '早晨吃药',
      description: '早晨按时服药（08:00 开始提醒，10:30 截止）',
      icon: 'Pill',
      color: 'rose',
      category: 'health',
      type: 'reminder_window',
      start_time: '08:00',
      end_time: null,
      target_time: '10:30',
      target_metric: null,
      target_value: null,
      repeat_type: 'daily',
      repeat_days: '1,2,3,4,5,6,7',
      sort_order: 3
    },
    {
      user_id: userId,
      title: '深度阅读',
      description: '不限时间，记录读的书名、起止页数与耗时',
      icon: 'BookOpen',
      color: 'amber',
      category: 'study',
      type: 'quantified_log',
      start_time: null,
      end_time: null,
      target_time: null,
      target_metric: 'pages',
      target_value: 20,
      repeat_type: 'daily',
      repeat_days: '1,2,3,4,5,6,7',
      sort_order: 4
    },
    {
      user_id: userId,
      title: '自律断舍离 (不吃零食/不喝汽水)',
      description: '今日保持清淡饮食，不吃零食、不喝汽水、不熬夜',
      icon: 'ShieldCheck',
      color: 'purple',
      category: 'self_discipline',
      type: 'abstinence',
      start_time: null,
      end_time: null,
      target_time: null,
      target_metric: null,
      target_value: null,
      repeat_type: 'daily',
      repeat_days: '1,2,3,4,5,6,7',
      sort_order: 5
    }
  ]

  const transaction = db.transaction(() => {
    for (const task of defaultTasks) {
      insertStmt.run(task)
    }
  })

  transaction()
}
