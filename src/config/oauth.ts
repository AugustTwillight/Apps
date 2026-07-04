/**
 * 社交登录配置
 * 
 * 接入前准备：
 * 1. 微信: https://open.weixin.qq.com → 创建移动应用 → 获取 AppID
 * 2. QQ:  https://connect.qq.com → 创建应用 → 获取 App ID
 * 
 * 注意：
 * - redirectUri 必须在对应开放平台的后台配置为合法域名
 * - 替换下方 YOUR_APP_ID 为真实值
 */

export const OAUTH_CONFIG = {
  // ===== 微信登录 =====
  wechat: {
    // 在 https://open.weixin.qq.com 注册后获得的 AppID
    appId: 'YOUR_WECHAT_APP_ID',
    // 微信 OAuth 授权页面
    authorizeUrl: 'https://open.weixin.qq.com/connect/oauth2/authorize',
    // 授权后回调地址（需在微信开放平台配置）
    redirectUri: 'tongxue://oauth/wechat',
    // 授权 scope
    scope: 'snsapi_userinfo',
  },

  // ===== QQ 登录 =====
  qq: {
    // 在 https://connect.qq.com 注册后获得的 App ID
    appId: 'YOUR_QQ_APP_ID',
    // QQ OAuth 授权页面
    authorizeUrl: 'https://graph.qq.com/oauth2.0/authorize',
    // 授权后回调地址（需在 QQ 互联配置）
    redirectUri: 'tongxue://oauth/qq',
    // 授权 scope
    scope: 'get_user_info',
  },

  // ===== 通用 =====
  // App 自定义 URL Scheme（用于接收 OAuth 回调）
  appScheme: 'tongxue',
};
