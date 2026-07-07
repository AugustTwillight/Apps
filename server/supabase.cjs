const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in environment');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// 工具函数：获取用户
async function getUserById(id) {
  const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  return data;
}

async function getUserByOpenid(openid, field) {
  const { data } = await supabase.from('users').select('*').eq(field, openid).maybeSingle();
  return data;
}

async function getUserByPhone(phone) {
  const { data } = await supabase.from('users').select('*').eq('phone', phone).maybeSingle();
  return data;
}

async function createUser(nickname, extra = {}) {
  const id = 'u_' + require('uuid').v4().slice(0, 8);
  const { data, error } = await supabase.from('users').insert({
    id, nickname, ...extra
  }).select().maybeSingle();
  if (error) { console.error('createUser error:', error); return null; }
  return data;
}

async function updateUser(id, updates) {
  const { data } = await supabase.from('users').update(updates).eq('id', id).select().maybeSingle();
  return data;
}

async function getVerificationCode(phone) {
  const { data } = await supabase.from('verification_codes')
    .select('*').eq('phone', phone)
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  return data;
}

async function saveVerificationCode(phone, code) {
  await supabase.from('verification_codes').insert({ phone, code });
}

async function deleteVerificationCode(phone) {
  await supabase.from('verification_codes').delete().eq('phone', phone);
}

async function getRank() {
  const { data } = await supabase.from('users')
    .select('id, nickname, avatar, total_study_hours')
    .order('total_study_hours', { ascending: false }).limit(50);
  return (data || []).map((u, i) => ({ ...u, hours: u.total_study_hours, rank: i + 1 }));
}

module.exports = {
  supabase,
  getUserById, getUserByOpenid, getUserByPhone,
  createUser, updateUser,
  getVerificationCode, saveVerificationCode, deleteVerificationCode,
  getRank,
};
