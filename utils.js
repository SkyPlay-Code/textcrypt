/* =========================================
   AEGIS SUITE - SHARED UTILITIES
   ========================================= */

window.Aegis = {
    sessionOperations: 0,
    clipboardTimers: {},

    // UI: Increment Operation Counter
    incrementOp() {
        this.sessionOperations++;
        const counterEl = document.getElementById('session-counter');
        if (counterEl) {
            counterEl.innerText = this.sessionOperations;
        }
    },

    // UI: Status Messages
    showStatus(elementId, message, isError = false) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.className = `status-msg ${isError ? 'error' : 'success'}`;
        el.innerText = message;
        setTimeout(() => { el.style.display = 'none'; }, 5000);
    },

    // UI: Toggle Password Visibility
    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.type = input.type === "password" ? "text" : "password";
        }
    },

    // UI: Copy to Clipboard with 30s Countdown
    async copyWithCountdown(textToCopy, buttonId) {
        if (!textToCopy) return;
        try {
            await navigator.clipboard.writeText(textToCopy);
            const btn = document.getElementById(buttonId);
            const originalText = btn.innerHTML;
            
            if (this.clipboardTimers[buttonId]) clearInterval(this.clipboardTimers[buttonId]);

            let timeLeft = 30;
            btn.innerHTML = `Copied! Clearing in ${timeLeft}s`;
            btn.classList.add('btn-secondary');

            this.clipboardTimers[buttonId] = setInterval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    clearInterval(this.clipboardTimers[buttonId]);
                    navigator.clipboard.writeText(''); // Clear clipboard
                    btn.innerHTML = originalText;
                    btn.classList.remove('btn-secondary');
                } else {
                    btn.innerHTML = `Copied! Clearing in ${timeLeft}s`;
                }
            }, 1000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    },

    // UI: Panic Button Wipe
    panicWipe() {
        // Clear all inputs and textareas
        document.querySelectorAll('input, textarea').forEach(el => {
            if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = false;
            } else {
                el.value = '';
            }
        });
        
        // Clear output areas
        document.querySelectorAll('.output-area').forEach(el => {
            el.innerText = '';
        });

        // Clear clipboard
        navigator.clipboard.writeText('');

        // Stop media tracks if any (for Audio tools)
        if (window.aegisAudioContext) {
            window.aegisAudioContext.close();
        }

        alert("PANIC WIPE EXECUTED:\nAll fields cleared.\nClipboard emptied.");
    },

    // CRYPTO: Derive AES-256-GCM Key using PBKDF2
    async deriveKey(passwordStr, saltBuffer, iterations = 250000) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw", 
            enc.encode(passwordStr), 
            { name: "PBKDF2" }, 
            false, 
            ["deriveKey"]
        );
        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: saltBuffer,
                iterations: iterations,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true, // Extractable for tools that might need to show it, otherwise specific tools can re-implement
            ["encrypt", "decrypt"]
        );
    },

    // DATA CONVERSION: Uint8Array <-> Binary String / Array
    bytesToBits(bytes) {
        const bits =[];
        for (let i = 0; i < bytes.length; i++) {
            for (let j = 7; j >= 0; j--) {
                bits.push((bytes[i] >> j) & 1);
            }
        }
        return bits;
    },

    bitsToBytes(bits) {
        const bytes = new Uint8Array(Math.floor(bits.length / 8));
        for (let i = 0; i < bytes.length; i++) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                byte |= (bits[i * 8 + j] << (7 - j));
            }
            bytes[i] = byte;
        }
        return bytes;
    },

    // DATA CONVERSION: ArrayBuffer <-> Base64
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    },

    base64ToArrayBuffer(base64) {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
};