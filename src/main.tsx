import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// React 挂载后隐藏加载界面
function hideLoadingOverlay() {
  const el = document.getElementById('app-loading');
  if (el) {
    el.classList.add('hidden');
    // 完全移除 DOM 节点
    setTimeout(() => el.remove(), 600);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// React 渲染完成后隐藏加载界面
hideLoadingOverlay();
