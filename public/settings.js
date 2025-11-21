async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const data = await response.json();

        const walletStatus = document.getElementById('walletStatus');
        const networkStatus = document.getElementById('networkStatus');
        const apiKeyStatus = document.getElementById('apiKeyStatus');
        const recipientStatus = document.getElementById('recipientStatus');

        if (data.hasWallet) {
            walletStatus.textContent = '✅ تم الإعداد';
            walletStatus.className = 'status-badge success';
        } else {
            walletStatus.textContent = '❌ غير مُعد';
            walletStatus.className = 'status-badge error';
        }

        if (data.network) {
            networkStatus.textContent = data.network === 'mainnet' ? '🌐 Mainnet' : '🧪 Testnet';
            networkStatus.className = 'status-badge success';
        } else {
            networkStatus.textContent = '⚠️ افتراضي: testnet';
            networkStatus.className = 'status-badge warning';
        }

        if (data.hasApiKey) {
            apiKeyStatus.textContent = '✅ تم الإعداد';
            apiKeyStatus.className = 'status-badge success';
        } else {
            apiKeyStatus.textContent = '⚠️ غير مُعد (اختياري)';
            apiKeyStatus.className = 'status-badge warning';
        }

        if (data.recipientAddress) {
            recipientStatus.textContent = '✅ ' + data.recipientAddress.substring(0, 20) + '...';
            recipientStatus.className = 'status-badge success';
        } else {
            recipientStatus.textContent = '⚠️ غير مُعد (اختياري)';
            recipientStatus.className = 'status-badge warning';
        }
    } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
    }
}

function downloadProject() {
    window.location.href = '/api/download-project';
}

loadSettings();
setInterval(loadSettings, 5000);
