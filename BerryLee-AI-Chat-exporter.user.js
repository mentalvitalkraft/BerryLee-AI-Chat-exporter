// ==UserScript==
// @name         AI Chat Exporter Pro (Nur Chat-Inhalt)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Exportiert nur den eigentlichen Chat (Nachrichten) mit guter Formatierung – stabiler Button
// @author       Grok (angepasst für dich)
// @match        *://chatgpt.com/*
// @match        *://claude.ai/*
// @match        *://gemini.google.com/*
// @match        *://grok.x.ai/*
// @match        *://grok.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let exportButton = null;

    function getChatMessages() {
        // Versucht, Nachrichten-Container zu finden (plattform-spezifisch)
        const selectors = [
            '[data-message-author-role]',  // ChatGPT
            '.claude-message',             // Claude
            'article',                     // Gemini / allgemein
            '.message',                    // Allgemein
            '[class*="message"]',
            '.prose'                       // Markdown-Inhalte
        ];

        let messages = [];
        for (let selector of selectors) {
            const found = document.querySelectorAll(selector);
            if (found.length > 3) {
                messages = found;
                break;
            }
        }

        let markdown = '';

        messages.forEach((msg, index) => {
            let text = msg.innerText.trim();
            if (text.length < 10) return;

            const role = msg.getAttribute('data-message-author-role') || 
                        (msg.classList.contains('user') || msg.textContent.includes('Du') ? 'user' : 'assistant');

            const prefix = role === 'user' ? '### 👤 Du:\n' : '### 🤖 KI:\n';
            markdown += prefix + text + '\n\n---\n\n';
        });

        return markdown || document.body.innerText; // Fallback
    }

    function exportChat() {
        const markdownContent = getChatMessages();
        if (!markdownContent || markdownContent.length < 100) {
            alert("Konnte keinen Chat-Inhalt finden. Bitte in einem aktiven Chat sein.");
            return;
        }

        const date = new Date().toLocaleString('de-DE');
        const fullMarkdown = `# AI Chat Export\n\n**Datum:** ${date}\n\n` + markdownContent;

        const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString().slice(0,10)}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function createButton() {
        if (document.getElementById('ai-pro-export-btn')) return;

        exportButton = document.createElement('button');
        exportButton.id = 'ai-pro-export-btn';
        exportButton.innerHTML = '📥 Nur Chat exportieren';
        
        exportButton.style.cssText = `
            position: fixed !important;
            bottom: 30px !important;
            right: 30px !important;
            z-index: 999999 !important;
            padding: 14px 22px !important;
            background: #10a37f !important;
            color: white !important;
            border: none !important;
            border-radius: 10px !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
        `;

        exportButton.onclick = exportChat;
        document.body.appendChild(exportButton);
    }

    // Stabiler Button-Mechanismus
    function init() {
        createButton();

        const observer = new MutationObserver(() => {
            if (!document.getElementById('ai-pro-export-btn')) createButton();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setInterval(() => {
            if (!document.getElementById('ai-pro-export-btn')) createButton();
        }, 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
