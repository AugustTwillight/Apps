package com.tongxue.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 在 WebView 创建后配置额外设置
        getBridge().getWebView().post(() -> {
            WebView webView = getBridge().getWebView();
            WebSettings settings = webView.getSettings();
            
            // 三星 WebView 兼容性设置
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            
            // 启用硬件加速渲染
            webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
        });
    }
}
