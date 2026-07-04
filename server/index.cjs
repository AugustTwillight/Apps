const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envFile = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envFile)) {
    const lines = fs.readFileSync(envFile, 'utf-8').split('\n');
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '3001');
const JWT_SECRET = process.env.JWT_SECRET || 'tongxue-app-secret-2026';
const WA = process.env.WECHAT_APP_ID || '';
const WS = process.env.WECHAT_APP_SECRET || '';
const QA = process.env.QQ_APP_ID || '';
const QS = process.env.QQ_APP_SECRET || '';
const DB_PATH = path.resolve(__dirname, '..', process.env.DB_PATH || './data/tongxue.db');

let db;
async function initDB() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, nickname TEXT, avatar TEXT, phone TEXT, wechat_openid TEXT, qq_openid TEXT, credit_score INTEGER DEFAULT 100, deposit_amount REAL DEFAULT 0, total_study_hours REAL DEFAULT 0, consecutive_days INTEGER DEFAULT 0, level INTEGER DEFAULT 1, title TEXT DEFAULT '初学者', register_method TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')))");
  saveDB(); console.log('DB ready:', DB_PATH);
}
function saveDB() { fs.writeFileSync(DB_PATH, Buffer.from(db.export())); }
function q(sql, p) { const s = db.prepare(sql); if (p) s.bind(Object.values(p)); const r = []; while (s.step()) r.push(s.getAsObject()); s.free(); return r; }
function run(sql, p) { db.run(sql, Object.values(p)); saveDB(); }

function getUser(id) { const r = q('SELECT * FROM users WHERE id = ?', {a:id}); return r.length ? r[0] : null; }
function getByOpenid(oid, f) { const r = q('SELECT * FROM users WHERE ' + f + ' = ?', {a:oid}); return r.length ? r[0] : null; }
function getByPhone(p) { const r = q('SELECT * FROM users WHERE phone = ?', {a:p}); return r.length ? r[0] : null; }
function createUser(d) {
  const id = 'u_' + uuidv4().slice(0,8);
  run("INSERT INTO users (id,nickname,phone,wechat_openid,qq_openid,register_method) VALUES (?,?,?,?,?,?)", {a:id,b:d.nickname,c:d.phone||'',d:d.wechatOpenid||'',e:d.qqOpenid||'',f:d.method||''});
  return getUser(id);
}

const app = express();
app.use(cors()); app.use(express.json());

function auth(req, res, next) {
  const a = req.headers.authorization;
  if (!a || !a.startsWith('Bearer ')) return res.status(401).json({error:'未登录'});
  try { req.userId = jwt.verify(a.split(' ')[1], JWT_SECRET).userId; next(); }
  catch { res.status(401).json({error:'登录已过期'}); }
}

function safe(u) {
  if (!u) return null;
  return { id:u.id, nickname:u.nickname, avatar:u.avatar||'', creditScore:u.credit_score, depositAmount:u.deposit_amount, totalStudyHours:u.total_study_hours, consecutiveDays:u.consecutive_days, level:u.level, title:u.title, registerMethod:u.register_method, createdAt:u.created_at };
}

app.get('/api/health', (req, res) => res.json({status:'ok', time:new Date().toISOString(), db:fs.existsSync(DB_PATH)?'ok':'init', social:{wechat:WA?'ok':'mock', qq:QA?'ok':'mock'}}));
app.post('/api/auth/send-code', (req, res) => {
  const p = req.body.phone;
  if (!p || p.length < 11) return res.status(400).json({error:'请输入正确的手机号'});
  console.log('[验证码]', p, '-> 1234');
  res.json({success:true, message:'验证码已发送（测试: 1234）'});
});
app.post('/api/auth/phone-login', (req, res) => {
  const {phone, code} = req.body;
  if (!phone || !code) return res.status(400).json({error:'手机号和验证码不能为空'});
  if (code !== '1234') return res.status(400).json({error:'验证码错误'});
  let u = getByPhone(phone);
  if (!u) u = createUser({nickname:'用户'+phone.slice(-4), phone, method:'phone'});
  res.json({token:jwt.sign({userId:u.id}, JWT_SECRET, {expiresIn:'7d'}), user:safe(u)});
});
app.post('/api/auth/wechat-login', async (req, res) => {
  const {code} = req.body;
  if (!code) return res.status(400).json({error:'缺少微信授权码'});
  let oid, nick, ava;
  if (WA) { try {
    const r = await fetch('https://api.weixin.qq.com/sns/oauth2/access_token?appid='+WA+'&secret='+WS+'&code='+code+'&grant_type=authorization_code');
    const d = await r.json();
    if (!d.errcode) { oid = d.openid;
      const u = await fetch('https://api.weixin.qq.com/sns/userinfo?access_token='+d.access_token+'&openid='+oid+'&lang=zh_CN');
      const ud = await u.json();
      if (!ud.errcode) { nick = ud.nickname; ava = ud.headimgurl; }
    }
  } catch(e) { console.error('[微信]', e.message); } }
  if (!oid) { oid = 'wx_'+uuidv4().slice(0,12); nick = '微信用户'; ava = ''; }
  let u = getByOpenid(oid, 'wechat_openid');
  if (!u) u = createUser({nickname:nick, wechatOpenid:oid, method:'wechat'});
  res.json({token:jwt.sign({userId:u.id}, JWT_SECRET, {expiresIn:'7d'}), user:safe(u)});
});
app.post('/api/auth/qq-login', async (req, res) => {
  const {code} = req.body;
  if (!code) return res.status(400).json({error:'缺少 QQ 授权码'});
  let oid, nick, ava;
  if (QA) { try {
    const r = await fetch('https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id='+QA+'&client_secret='+QS+'&code='+code+'&fmt=json');
    const d = await r.json();
    if (!d.error) {
      const m = await fetch('https://graph.qq.com/oauth2.0/me?access_token='+d.access_token+'&fmt=json');
      const md = await m.json();
      if (!md.error) { oid = md.openid;
        const u = await fetch('https://graph.qq.com/user/get_user_info?access_token='+d.access_token+'&oauth_consumer_key='+QA+'&openid='+oid);
        const ud = await u.json();
        if (ud.ret === 0) { nick = ud.nickname; ava = ud.figureurl_qq_2; }
      }
    }
  } catch(e) { console.error('[QQ]', e.message); } }
  if (!oid) { oid = 'qq_'+uuidv4().slice(0,12); nick = 'QQ用户'; ava = ''; }
  let u = getByOpenid(oid, 'qq_openid');
  if (!u) u = createUser({nickname:nick, qqOpenid:oid, method:'qq'});
  res.json({token:jwt.sign({userId:u.id}, JWT_SECRET, {expiresIn:'7d'}), user:safe(u)});
});
app.get('/api/user/profile', auth, (req, res) => { const u = getUser(req.userId); if (!u) return res.status(404).json({error:'用户不存在'}); res.json({user:safe(u)}); });
app.put('/api/user/profile', auth, (req, res) => {
  const u = getUser(req.userId);
  if (!u) return res.status(404).json({error:'用户不存在'});
  if (req.body.nickname) run("UPDATE users SET nickname = ? WHERE id = ?", {a:req.body.nickname, b:req.userId});
  res.json({user:safe(getUser(req.userId))});
});
app.get('/api/rank', auth, (req, res) => {
  const ranks = q('SELECT id,nickname,avatar,total_study_hours as hours FROM users ORDER BY total_study_hours DESC LIMIT 50');
  res.json({ranks:ranks.map((u,i)=>({...u,rank:i+1}))});
});

async function start() {
  await initDB();
  console.log('微信:', WA?'已配置':'模拟'); console.log('QQ:', QA?'已配置':'模拟');
  app.listen(PORT, '0.0.0.0', () => console.log('\n同学服务器 -> http://localhost:'+PORT+'\n'));
}
start().catch(e => { console.error('失败:', e); process.exit(1); });
