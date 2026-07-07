const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// ���� .env
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf-8').split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('='); if (i === -1) continue;
    if (!process.env[t.slice(0,i).trim()]) process.env[t.slice(0,i).trim()] = t.slice(i+1).trim();
  }
}

// ���ݿ⣺���� Supabase�����˵����� SQLite
let db, dbType = 'supabase';
async function initDB() {
  try {
    db = require('./supabase.cjs');
    await db.getUserById('__verify__');
    dbType = 'supabase';
    console.log('[DB] ✅ 使用 Supabase');
  } catch (e) {
    console.log('[DB] ⚠️ Supabase 不可用，回退到本地 SQLite (' + e.message + ')');
    const localDb = require('./local-db.cjs');
    await localDb.init();
    db = localDb;
    dbType = 'local';
  }
}
const app = express();
const PORT = parseInt(process.env.PORT || '3001');
const JWT_SECRET = process.env.JWT_SECRET || 'tongxue-app-2026';
const WA = process.env.WECHAT_APP_ID || ''; const WS = process.env.WECHAT_APP_SECRET || '';
const QA = process.env.QQ_APP_ID || ''; const QS = process.env.QQ_APP_SECRET || '';
const TWILIO_SID = process.env.TWILIO_SID || '';
const TWILIO_TOKEN = process.env.TWILIO_TOKEN || '';
const TWILIO_PHONE = process.env.TWILIO_PHONE || '';

app.use(cors()); app.use(express.json({limit:'10mb'}));

// JWT �м��
function auth(req, res, next) {
  const a = req.headers.authorization;
  if (!a || !a.startsWith('Bearer ')) return res.status(401).json({error:'δ��¼'});
  try { req.userId = jwt.verify(a.split(' ')[1], JWT_SECRET).userId; next(); }
  catch { res.status(401).json({error:'��¼�ѹ���'}); }
}

function safe(u) {
  if (!u) return null;
  return { id:u.id, nickname:u.nickname, avatar:u.avatar||'', creditScore:u.credit_score, depositAmount:u.deposit_amount, totalStudyHours:u.total_study_hours, consecutiveDays:u.consecutive_days, level:u.level, title:u.title, registerMethod:u.register_method, createdAt:u.created_at };
}

// ���Ͷ�����֤��
async function sendSMS(phone, code) {
  if (TWILIO_SID && TWILIO_TOKEN) {
    const a = Buffer.from(TWILIO_SID+':'+TWILIO_TOKEN).toString('base64');
    await fetch('https://api.twilio.com/2010-04-01/Accounts/'+TWILIO_SID+'/Messages.json', {
      method:'POST', headers:{'Authorization':'Basic '+a,'Content-Type':'application/x-www-form-urlencoded'},
      body: new URLSearchParams({To:'+86'+phone, From:TWILIO_PHONE, Body:'[ͬѧ] ��֤��: '+code+'��5��������Ч'})
    });
    console.log('[SMS] Twilio ����:', phone, code);
  } else {
    console.log('[SMS] ����ģʽ, ��֤��:', phone, '->', code);
  }
}

// ===== ·�� =====

// �������
app.get('/api/health', (req, res) => {
    dbType = 'supabase';
    social:{wechat:WA?'ok':'mock', qq:QA?'ok':'mock'},
    dbType = 'supabase';
});

// ������֤��
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const phone = req.body.phone;
    if (!phone || phone.length < 11) return res.status(400).json({error:'��������ȷ���ֻ���'});
    const code = String(Math.floor(1000 + Math.random() * 9000));
    await db.saveVerificationCode(phone, code);
    await sendSMS(phone, code);
    res.json({success:true, message:'��֤���ѷ���'});
  } catch (e) {
});

// �ֻ��ŵ�¼
app.post('/api/auth/phone-login', async (req, res) => {
  try {
    const {phone, code} = req.body;
    if (!phone || !code) return res.status(400).json({error:'�ֻ��ź���֤�벻��Ϊ��'});
    const record = await db.getVerificationCode(phone);
    if (!record || record.code !== code) return res.status(400).json({error:'��֤�����'});
    await db.deleteVerificationCode(phone);
    let user = await db.getUserByPhone(phone);
    if (!user) user = await db.createUser('�û�'+phone.slice(-4), {phone, register_method:'phone'});
    if (!user) return res.status(500).json({error:'�����û�ʧ��'});
    res.json({token:jwt.sign({userId:user.id}, JWT_SECRET, {expiresIn:'7d'}), user:safe(user)});
  } catch (e) {
});

// ΢�ŵ�¼
app.post('/api/auth/wechat-login', async (req, res) => {
  try {
    const code = req.body.code;
    if (!code) return res.status(400).json({error:'ȱ��΢����Ȩ��'});
    let oid, nick;
    if (WA) try {
      const r = await fetch('https://api.weixin.qq.com/sns/oauth2/access_token?appid='+WA+'&secret='+WS+'&code='+code+'&grant_type=authorization_code');
      const d = await r.json();
      if (!d.errcode) { oid = d.openid;
        const u = await fetch('https://api.weixin.qq.com/sns/userinfo?access_token='+d.access_token+'&openid='+oid+'&lang=zh_CN');
        const ud = await u.json(); if (!ud.errcode) nick = ud.nickname; }
  } catch (e) {
    if (!oid) { oid = 'wx_'+uuidv4().slice(0,12); nick = '΢���û�'; }
    let user = await db.getUserByOpenid(oid, 'wechat_openid');
    if (!user) user = await db.createUser(nick, {wechat_openid:oid, register_method:'wechat'});
    if (!user) return res.status(500).json({error:'�����û�ʧ��'});
    res.json({token:jwt.sign({userId:user.id}, JWT_SECRET, {expiresIn:'7d'}), user:safe(user)});
  } catch (e) {
});

// QQ ��¼
app.post('/api/auth/qq-login', async (req, res) => {
  try {
    const code = req.body.code;
    if (!code) return res.status(400).json({error:'ȱ�� QQ ��Ȩ��'});
    let oid, nick;
    if (QA) try {
      const r = await fetch('https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id='+QA+'&client_secret='+QS+'&code='+code+'&fmt=json');
      const d = await r.json();
      if (!d.error) {
        const m = await fetch('https://graph.qq.com/oauth2.0/me?access_token='+d.access_token+'&fmt=json');
        const md = await m.json(); if (!md.error) { oid = md.openid;
          const u = await fetch('https://graph.qq.com/user/get_user_info?access_token='+d.access_token+'&oauth_consumer_key='+QA+'&openid='+oid);
          const ud = await u.json(); if (ud.ret===0) nick = ud.nickname; }
      }
  } catch (e) {
    if (!oid) { oid = 'qq_'+uuidv4().slice(0,12); nick = 'QQ�û�'; }
    let user = await db.getUserByOpenid(oid, 'qq_openid');
    if (!user) user = await db.createUser(nick, {qq_openid:oid, register_method:'qq'});
    if (!user) return res.status(500).json({error:'�����û�ʧ��'});
    res.json({token:jwt.sign({userId:user.id}, JWT_SECRET, {expiresIn:'7d'}), user:safe(user)});
  } catch (e) {
});

// �û���Ϣ
app.get('/api/user/profile', auth, async (req, res) => {
  const u = await db.getUserById(req.userId);
  if (!u) return res.status(404).json({error:'�û�������'});
  res.json({user:safe(u)});
});
app.put('/api/user/profile', auth, async (req, res) => {
  const up = {};
  if (req.body.nickname) up.nickname = req.body.nickname;
  if (req.body.avatar) up.avatar = req.body.avatar;
  const u = await db.updateUser(req.userId, up);
  res.json({user:safe(u)});
});

// ���а�
app.get('/api/rank', auth, async (req, res) => {
  const ranks = await db.getRank();
  res.json({ranks});
});

// �ļ��ϴ���ͷ��/����Ƭ��
app.post('/api/upload', auth, async (req, res) => {
  try {
    const {bucket, file} = req.body;
    if (!bucket || !file) return res.status(400).json({error:'ȱ�� bucket �� file ����'});
    const ext = file.split(';')[0].split('/')[1] || 'png';
    const name = req.userId + '_' + Date.now() + '.' + ext;
    const base64 = file.split(',')[1];
    dbType = 'supabase';
      const dir = path.join(__dirname, '..', 'data', 'uploads');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, name), Buffer.from(base64, 'base64'));
      res.json({url: '/uploads/' + name, name});
    } else {
      const {data, error} = await db.supabase.storage.from(bucket).upload(name, Buffer.from(base64, 'base64'), {contentType:'image/'+ext, upsert:true});
      if (error) return res.status(500).json({error:error.message});
      const {data:urlData} = db.supabase.storage.from(bucket).getPublicUrl(name);
      res.json({url: urlData.publicUrl, name});
    }
  } catch (e) {
});

// ��������������ǰ�˾�̬�ļ�
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return;
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
  console.log('[Static] ? ǰ�˾�̬�ļ��Ѽ���');
} else {
  console.log('[Static] ?? δ�ҵ� dist/���� API ���� (����ģʽ)');
}

// ����ģʽ�������ϴ��ļ�
app.use('/uploads', (req, res, next) => {
    dbType = 'supabase';
    express.static(path.join(__dirname, '..', 'data', 'uploads'))(req, res, next);
  } else {
    next();
  }
});

// ===== ��� =====
async function start() {
  await initDB();
  console.log('\nͬѧ������');
    dbType = 'supabase';
  console.log('  ����:', TWILIO_SID?'Twilio':'����ģʽ(console)');
  console.log('  ΢��:', WA?'������':'ģ��');
  console.log('  QQ:', QA?'������':'ģ��');
  console.log('  JWT ��Կ:', JWT_SECRET.slice(0,8)+'...');
  app.listen(PORT, '0.0.0.0', () => console.log('  �� http://localhost:'+PORT+'\n'));
}
start();