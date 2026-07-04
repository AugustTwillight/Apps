import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAppStore } from '../../store/useAppStore';
import { OAUTH_CONFIG } from '../../config/oauth';
import { authApi } from '../../api';

type LoginMethod = 'phone' | 'wechat' | 'qq';

// URL 参数提取（兼容自定义 URL Scheme）
function extractQueryParam(url: string, param: string): string | null {
  const match = url.match(new RegExp(`[?&]${param}=([^&]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function LoginPage() {
  const { login, setServerUrl, serverUrl } = useAppStore();
  const [method, setMethod] = useState<LoginMethod>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUrl, setEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(serverUrl);
  const [waitingOAuth, setWaitingOAuth] = useState(false);
  const activeRef = useRef(true);

  // ===== OAuth 回调监听 =====
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    activeRef.current = true;

    let handler: any;
    const setupListener = async () => {
      const { App } = await import('@capacitor/app');
      handler = await App.addListener('appUrlOpen', async (data: any) => {
        if (!activeRef.current) return;
        const url: string = data.url;
        if (!url.startsWith(OAUTH_CONFIG.appScheme + '://oauth/')) return;

        setWaitingOAuth(false);
        const authCode = extractQueryParam(url, 'code');
        if (!authCode) { setError('授权失败：未获取到授权码'); setLoading(false); return; }

        setError('');
        try {
          let res;
          if (url.includes('/wechat')) {
            res = await authApi.wechatLogin(authCode);
          } else if (url.includes('/qq')) {
            res = await authApi.qqLogin(authCode);
          } else {
            setError('未知的登录来源'); setLoading(false); return;
          }
          login(res.token, res.user);
        } catch (e: any) {
          setError(e.message || '社交登录失败，请重试');
          setLoading(false);
        }
      });
    };
    setupListener();

    return () => {
      activeRef.current = false;
      if (handler) handler.remove();
    };
  }, [login]);

  // ===== 手机验证码 =====
  const handleSendCode = async () => {
    if (phone.length < 11) { setError('请输入完整的手机号'); return; }
    setLoading(true); setError('');
    try {
      await authApi.sendCode(phone);
      setCodeSent(true);
      setCountdown(60);
      const t = setInterval(() => setCountdown(c => { if (c <= 1) clearInterval(t); return c - 1; }), 1000);
    } catch (e: any) {
      setError(e.message || '发送失败');
    } finally { setLoading(false); }
  };

  const handlePhoneLogin = async () => {
    if (!code) { setError('请输入验证码'); return; }
    setLoading(true); setError('');
    try {
      const res = await authApi.phoneLogin(phone, code);
      login(res.token, res.user);
    } catch (e: any) {
      setError(e.message || '登录失败');
    } finally { setLoading(false); }
  };

  // ===== 社交登录 =====
  const handleSocialLogin = async (provider: 'wechat' | 'qq') => {
    setLoading(true); setError('');
    const config = OAUTH_CONFIG[provider];

    // 未配置 AppID 或非原生环境 → 使用模拟模式
    if (!Capacitor.isNativePlatform() || config.appId.startsWith('YOUR_') ||
        !Capacitor.isNativePlatform() || config.appId.startsWith('YOUR_')) {
      // 模拟模式（开发测试用）
      if (provider === 'qq' || provider === 'wechat') {
        try {
          const res = await authApi.wechatLogin('mock_' + provider + '_' + Date.now());
          login(res.token, res.user);
        } catch (e: any) {
          setError(e.message || '登录失败');
        } finally { setLoading(false); }
      }
      return;
    }

    // 真实 OAuth 流程
    try {
      const { Browser } = await import('@capacitor/browser');
      const state = crypto.randomUUID?.() || Math.random().toString(36);
      const redirectEncoded = encodeURIComponent(config.redirectUri);

      let oauthUrl: string;
      if (provider === 'wechat') {
        oauthUrl = `${config.authorizeUrl}?appid=${config.appId}&redirect_uri=${redirectEncoded}&response_type=code&scope=${config.scope}&state=${state}#wechat_redirect`;
      } else {
        oauthUrl = `${config.authorizeUrl}?response_type=code&client_id=${config.appId}&redirect_uri=${redirectEncoded}&scope=${config.scope}&state=${state}`;
      }

      setWaitingOAuth(true);
      await Browser.open({ url: oauthUrl, windowName: '_blank' });
      // 不 await — 回调由 appUrlOpen 监听处理
    } catch (e: any) {
      setWaitingOAuth(false);
      setError(e.message || '无法打开授权页面');
      setLoading(false);
    }
  };

  // ===== 健康检查 =====
  const checkHealth = async () => {
    setError('');
    try {
      const res = await authApi.health();
      setError('✅ 服务器连接成功！' + (res.social?.wechat ? ' ' + res.social.wechat : ''));
    } catch (e: any) {
      setError('❌ 无法连接服务器: ' + (e.message || ''));
    }
  };

  const methods: { key: LoginMethod; label: string; icon: string }[] = [
    { key: 'phone', label: '手机登录', icon: '📱' },
    { key: 'wechat', label: '微信登录', icon: '💬' },
    { key: 'qq', label: 'QQ 登录', icon: '🐧' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-600 to-primary-800 flex flex-col justify-center px-6 pb-12">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          <span className="text-4xl">🎓</span>
        </div>
        <h1 className="text-3xl font-bold text-white">同学</h1>
        <p className="text-white/70 mt-1 text-sm">多人监督学习 · 自律即自由</p>
      </div>

      {/* OAuth 等待状态 */}
      {waitingOAuth && (
        <Card className="!bg-white/95 mb-4 text-center py-6 !p-4">
          <div className="animate-spin text-4xl mb-3 inline-block">⏳</div>
          <h3 className="font-bold text-gray-800">跳转至第三方授权...</h3>
          <p className="text-sm text-gray-500 mt-1">请在打开的页面中完成授权</p>
        </Card>
      )}

      {/* 登录卡片 */}
      {!waitingOAuth && (
        <Card className="!bg-white/95 backdrop-blur-sm !p-0 overflow-hidden">
          {/* 方法切换 */}
          <div className="flex border-b border-gray-100">
            {methods.map((m) => (
              <button key={m.key} onClick={() => { setMethod(m.key); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all relative ${
                  method === m.key ? 'text-primary-600' : 'text-gray-400'
                }`}>
                {m.icon} {m.label}
                {method === m.key && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-500 rounded-full" />}
              </button>
            ))}
          </div>

          <div className="p-6">
            {error && (
              <div className={`text-sm text-center mb-4 py-2 px-3 rounded-lg ${
                error.startsWith('✅') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
              }`}>{error}</div>
            )}

            {/* 手机登录 */}
            {method === 'phone' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">手机号</label>
                  <input type="tel" placeholder="请输入手机号" value={phone} maxLength={11}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-primary-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">验证码</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="输入验证码" value={code} maxLength={6}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-primary-400" />
                    <button onClick={handleSendCode} disabled={loading || countdown > 0}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                        countdown > 0 ? 'bg-gray-100 text-gray-400' : 'bg-primary-50 text-primary-600'
                      }`}>
                      {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '获取验证码'}
                    </button>
                  </div>
                </div>
                <Button variant="primary" fullWidth onClick={handlePhoneLogin} disabled={loading || !phone || !code}>
                  {loading ? '登录中...' : '登 录'}
                </Button>
                <p className="text-xs text-gray-400 text-center">测试验证码: 1234</p>
              </div>
            )}

            {/* 微信登录 */}
            {method === 'wechat' && (
              <div className="text-center space-y-4">
                <div className="py-6">
                  <span className="text-6xl">💬</span>
                  <p className="text-gray-500 mt-3 text-sm">点击下方按钮使用微信登录</p>
                  {OAUTH_CONFIG.wechat.appId.startsWith('YOUR_') && (
                    <p className="text-xs text-amber-500 mt-2">
                      ⚠️ 模拟模式 — 配置真实 AppID 后自动切换为真实授权
                    </p>
                  )}
                </div>
                <Button variant="primary" fullWidth onClick={() => handleSocialLogin('wechat')} disabled={loading}>
                  {loading ? '授权中...' : '💬 微信登录'}
                </Button>
              </div>
            )}

            {/* QQ 登录 */}
            {method === 'qq' && (
              <div className="text-center space-y-4">
                <div className="py-6">
                  <span className="text-6xl">🐧</span>
                  <p className="text-gray-500 mt-3 text-sm">点击下方按钮使用 QQ 登录</p>
                  {OAUTH_CONFIG.qq.appId.startsWith('YOUR_') && (
                    <p className="text-xs text-amber-500 mt-2">
                      ⚠️ 模拟模式 — 配置真实 AppID 后自动切换为真实授权
                    </p>
                  )}
                </div>
                <Button variant="primary" fullWidth onClick={() => handleSocialLogin('qq')} disabled={loading}>
                  {loading ? '授权中...' : '🐧 QQ 登录'}
                </Button>
              </div>
            )}

            <p className="text-[10px] text-gray-400 text-center mt-4">
              登录即表示同意 <span className="text-primary-500">用户协议</span> 和 <span className="text-primary-500">隐私政策</span>
            </p>
          </div>
        </Card>
      )}

      {/* 服务器设置 */}
      <div className="mt-4">
        <button onClick={() => setEditingUrl(!editingUrl)}
          className="text-white/50 text-xs mx-auto block hover:text-white/80 transition-colors">
          ⚙️ 服务器设置
        </button>
        {editingUrl && (
          <Card className="mt-2 !p-3">
            <div className="flex gap-2">
              <input type="text" value={tempUrl} onChange={e => setTempUrl(e.target.value)}
                placeholder="http://localhost:3001"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              <Button size="sm" variant="primary" onClick={() => { setServerUrl(tempUrl); setEditingUrl(false); }}>保存</Button>
              <Button size="sm" variant="ghost" onClick={checkHealth}>测试</Button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              📱 真机测试填入电脑局域网 IP: <code className="bg-gray-100 px-1 rounded">http://192.168.x.x:3001</code>
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
