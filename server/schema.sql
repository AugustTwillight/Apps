-- ===== 同学 App 数据库表结构 =====
-- 在 Supabase 后台 → SQL Editor → New Query → 粘贴执行

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL DEFAULT '',
  avatar TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  wechat_openid TEXT DEFAULT '',
  qq_openid TEXT DEFAULT '',
  credit_score INTEGER DEFAULT 100,
  deposit_amount REAL DEFAULT 0,
  total_study_hours REAL DEFAULT 0,
  consecutive_days INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  title TEXT DEFAULT '初学者',
  register_method TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 学习记录表
CREATE TABLE IF NOT EXISTS study_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  duration INTEGER NOT NULL DEFAULT 0,
  subject TEXT DEFAULT '',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 开 Row Level Security（但允许所有操作）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- 允许所有人读写（开发阶段）
DROP POLICY IF EXISTS "允许所有操作" ON users;
CREATE POLICY "允许所有操作" ON users FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "允许所有操作" ON verification_codes;
CREATE POLICY "允许所有操作" ON verification_codes FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "允许所有操作" ON study_sessions;
CREATE POLICY "允许所有操作" ON study_sessions FOR ALL USING (true) WITH CHECK (true);
