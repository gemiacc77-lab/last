document.addEventListener("DOMContentLoaded", function() {
    const overlayHTML = `
    <div id="payment-overlay">
        <div class="payment-status-card">
            <div id="loading-state">
                <div class="optiline-spinner"></div>
                <div class="status-text">
                    <h3>Processing Payment</h3>
                    <p>Securing your transaction...</p>
                </div>
            </div>
            <div id="success-state" style="display:none;">
                <div class="success-checkmark">
                    <i class="fas fa-check"></i>
                </div>
                <div class="status-text">
                    <h3 style="color: #a855f7;">Payment Approved</h3>
                    <p>Redirecting to secure setup...</p>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', overlayHTML);
});
const UI = {
    overlay: () => document.getElementById('payment-overlay'),
    loading: () => document.getElementById('loading-state'),
    success: () => document.getElementById('success-state'),
    showProcessing: function() {
        const overlay = this.overlay();
        if(overlay) overlay.classList.add('active');
        const loading = this.loading();
        if(loading) loading.style.display = 'block';
        const success = this.success();
        if(success) success.style.display = 'none';
    },
    showSuccess: function() {
        const loading = this.loading();
        if(loading) loading.style.display = 'none';
        const success = this.success();
        if(success) success.style.display = 'block';
        const checkmark = document.querySelector('.success-checkmark');
        if(checkmark) checkmark.classList.add('animate-check');
    },
    hide: function() {
        const overlay = this.overlay();
        if(overlay) overlay.classList.remove('active');
    }
};
function initPayPalButton(config) {
    const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwWNsRWtnGwvE66VpDOeishxk6jGRT6oJ6Qup73vgHI7mjbMvPPQoTAFcdeHC9CD-_RJQ/exec";
    if (!window.paypal) {
        console.error("PayPal SDK not loaded!");
        return;
    }
    document.getElementById(config.containerId).innerHTML = "";
    paypal.Buttons({
        style: {
            shape: 'rect',
            color: 'blue', 
            layout: 'vertical',
            label: 'pay',
        },
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    description: config.packageName,
                    amount: { value: config.price }
                }]
            });
        },
        onApprove: function(data, actions) {
            UI.showProcessing();
            return actions.order.capture().then(function(details) {
                const marketerRef = (function() {
                    const getCookie = (name) => {
                        const v = `; ${document.cookie}`;
                        const p = v.split(`; ${name}=`);
                        if (p.length === 2) return p.pop().split(';').shift();
                        return null;
                    };
                    return getCookie('optiline_marketer_ref') || localStorage.getItem('optiline_marketer_ref') || '';
                })();
                console.log("Sending Payment with Marketer:", marketerRef);
                fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        event_type: "PAYMENT.CAPTURE.COMPLETED",
                        resource: {
                            id: details.id,
                            amount: { value: config.price },
                            payer: details.payer,
                            package: config.packageName,
                            marketer: marketerRef 
                        }
                    })
                })
                .then(response => response.json())
                .then(serverData => {
                    if (serverData.status === 'success' && serverData.url) {
                        UI.showSuccess();
                        setTimeout(() => {
                            window.location.href = serverData.url;
                        }, 2000);
                    } else {
                        throw new Error(serverData.message || "Verification failed");
                    }
                })
                .catch(err => {
                    console.error("Error:", err);
                    alert("Payment successful (ID: " + details.id + "), please contact support.");
                    UI.hide();
                });
            });
        },
        onError: function(err) {
            console.error('PayPal Error:', err);
            UI.hide();
            alert("Payment Error. Please try again.");
        }
    }).render('#' + config.containerId);
}
