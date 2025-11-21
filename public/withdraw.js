let currentBalance = 0;

async function loadBalance() {
    const balanceDiv = document.getElementById('balance');
    const walletAddressDiv = document.getElementById('walletAddress');
    const networkBadgeDiv = document.getElementById('networkBadge');
    const balanceCard = document.getElementById('balanceCard');

    balanceDiv.textContent = 'جاري التحميل...';
    balanceCard.classList.add('loading');

    try {
        const response = await fetch('/api/balance');
        const data = await response.json();

        if (response.ok) {
            currentBalance = parseFloat(data.balance);
            balanceDiv.textContent = `${data.balance} TON`;
            walletAddressDiv.textContent = `📍 ${data.address}`;
            networkBadgeDiv.textContent = data.network === 'mainnet' ? '🌐 Mainnet' : '🧪 Testnet';
        } else {
            balanceDiv.textContent = 'فشل التحميل';
            showMessage(data.error, 'error');
            
            if (data.error.includes('كلمات المحفظة')) {
                setTimeout(() => {
                    window.location.href = '/settings.html';
                }, 2000);
            }
        }
    } catch (error) {
        balanceDiv.textContent = 'خطأ في التحميل';
        showMessage('حدث خطأ: ' + error.message, 'error');
    } finally {
        balanceCard.classList.remove('loading');
    }
}

document.getElementById('withdrawForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const recipientAddress = document.getElementById('recipientAddress').value.trim();
    const amount = document.getElementById('amount').value;
    const transferComment = document.getElementById('transferComment').value.trim();
    const submitBtn = document.getElementById('submitBtn');

    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري الإرسال...';
    hideMessage();
    hideTransactionResult();

    try {
        const response = await fetch('/api/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipientAddress, amount, transferComment }),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ ' + data.message, 'success');
            showTransactionResult(data);
            document.getElementById('withdrawForm').reset();
            
            setTimeout(() => {
                loadBalance();
            }, 2000);
        } else {
            showMessage('❌ ' + data.error, 'error');
        }
    } catch (error) {
        showMessage('❌ حدث خطأ: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'إرسال التحويل';
    }
});

document.getElementById('amount').addEventListener('input', (e) => {
    const amount = parseFloat(e.target.value);
    const amountInUsdDiv = document.getElementById('amountInUsd');

    if (amount > 0 && currentBalance > 0) {
        if (amount > currentBalance) {
            amountInUsdDiv.textContent = '⚠️ المبلغ أكبر من رصيدك!';
            amountInUsdDiv.style.color = '#dc3545';
        } else {
            amountInUsdDiv.textContent = `✅ متاح في رصيدك`;
            amountInUsdDiv.style.color = '#28a745';
        }
    } else {
        amountInUsdDiv.textContent = '';
    }
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
}

function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'none';
}

function showTransactionResult(data) {
    const resultDiv = document.getElementById('transactionResult');
    document.getElementById('sentAmount').textContent = data.amount;
    document.getElementById('sentRecipient').textContent = data.recipient;
    document.getElementById('seqno').textContent = data.seqno;
    document.getElementById('explorerLink').href = data.explorerUrl;
    resultDiv.style.display = 'block';
}

function hideTransactionResult() {
    document.getElementById('transactionResult').style.display = 'none';
}

loadBalance();
