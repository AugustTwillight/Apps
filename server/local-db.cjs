/**
 * 本地 SQLite 数据库模块
 * 零外部依赖，替代 Supabase 用于开发/生产环境
 * 数据文件: ../data/tongxue.db
 */
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'tongxue.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

let db = null;

// ── 初始化 SQL.js ──
async function init() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const buffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
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
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      code TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      duration INTEGER NOT NULL DEFAULT 0,
      subject TEXT DEFAULT '',
      status TEXT DEFAULT 'completed',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  save();
  console.log('[LocalDB] SQLite 数据库已初始化:', DB_FILE);
}

function save() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

function queryOne(sql, params) {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  if (stmt.step()) { const r = stmt.getAsObject(); stmt.free(); return r; }
  stmt.free(); return null;
}

function queryAll(sql, params) {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free(); return rows;
}

function runSql(sql, params) {
  db.run(sql, params);
  save();
}

// ── 用户 API ──
async function getUserById(id) {
  return queryOne('SELECT * FROM users WHERE id = ?', [id]);
}
async function getUserByOpenid(openid, field) {
  return queryOne('SELECT * FROM users WHERE ' + field + ' = ?', [openid]);
}
async function getUserByPhone(phone) {
  return queryOne('SELECT * FROM users WHERE phone = ?', [phone]);
}
async function createUser(nickname, extra) {
  const id = 'u_' + uuidv4().slice(0, 8);
  runSql('INSERT INTO users (id,nickname,phone,wechat_openid,qq_openid,register_method,created_at) VALUES (?,?,?,?,?,?,?)',
    [id, nickname, extra.phone||'', extra.wechat_openid||'', extra.qq_openid||'', extra.register_method||'', new Date().toISOString()]);
  return getUserById(id);
}
async function updateUser(id, updates) {
  const sets = [], vals = [];
  for (const [k,v] of Object.entries(updates)) { sets.push(k+'=?'); vals.push(v); }
  if (!sets.length) return getUserById(id);
  vals.push(id);
  runSql('UPDATE users SET '+sets.join(',')+' WHERE id=?', vals);
  return getUserById(id);
}

// ── 验证码 API ──
async function getVerificationCode(phone) {
  return queryOne('SELECT * FROM verification_codes WHERE phone=? ORDER BY created_at DESC LIMIT 1', [phone]);
}
async function saveVerificationCode(phone, code) {
  runSql('INSERT INTO verification_codes (phone,code) VALUES (?,?)', [phone, code]);
}
async function deleteVerificationCode(phone) {
  runSql('DELETE FROM verification_codes WHERE phone=?', [phone]);
}

// ── 排行榜 ──
async function getRank() {
  const rows = queryAll('SELECT id,nickname,avatar,total_study_hours FROM users ORDER BY total_study_hours DESC LIMIT 50');
  return rows.map((u,i) => ({...u, hours:u.total_study_hours, rank:i+1}));
}

// ── 关闭 ──
function close() {
  if (db) { save(); db.close(); db = null; }
}

module.exports = { init, close, getUserById, getUserByOpenid, getUserByPhone, createUser, updateUser, getVerificationCode, saveVerificationCode, deleteVerificationCode, getRank };
