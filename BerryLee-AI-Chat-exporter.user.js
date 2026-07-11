// ==UserScript==
// @name         AI Chat Exporter (Stabil)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Zuverlässiger Export von AI-Chats als Markdown (auch bei langen Chats)
// @author       BerryLee
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

    function createExportButton() {
        if (exportButton && document.body.contains(exportButton)) return;

        // Alten Button entfernen falls vorhanden
        const old = document.getElementById('ai-stable-export-btn');
        if (old) old.remove();

        exportButton = document.createElement('button');
        exportButton.id = 'ai-stable-export-btn';
        exportButton.innerHTML = '📥 Export als Markdown';
        
        exportButton.style.cssText = `
            position: fixed !important;
            bottom: 24px !important;
            right: 24px !important;
            z-index: 999999 !important;
            padding: 12px 20px !important;
            background: #10a37f !important;
            color: white !important;
            border: none !important;
            border-radius: 10px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important;
            transition: all 0.2s ease !important;
        `;

        exportButton.onmouseenter = () => {
            exportButton.style.transform = 'scale(1.05)';
        };
        exportButton.onmouseleave = () => {
            exportButton.style.transform = 'scale(1)';
        };

        exportButton.onclick = exportChat;

        document.body.appendChild(exportButton);
    }

    function exportChat() {
        const chatContent = document.body.innerText.trim();
        
        if (!chatContent || chatContent.length < 50) {
            alert("Es konnte kein Chat-Inhalt gefunden werden.");
            return;
        }

        const date = new Date().toLocaleString('de-DE');
        const markdown = `# AI Chat Export\n\n**Datum:** ${date}\n\n---\n\n${chatContent}`;

        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString().slice(0,10)}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function init() {
        // Button erstellen
        createExportButton();

        // MutationObserver – erkennt Veränderungen im Chat
        const observer = new MutationObserver(() => {
            if (!document.getElementById('ai-stable-export-btn')) {
                createExportButton();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Zusätzliche Sicherung: Alle 2 Sekunden prüfen
        setInterval(() => {
            if (!document.getElementById('ai-stable-export-btn')) {
                createExportButton();
            }
        }, 2000);
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
