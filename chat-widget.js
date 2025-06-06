// Chat Widget Script
(function() {
    // --- i18n Internationalization ---
    const translations = {
        en: {
            sendButtonText: "Send",
            messagePlaceholder: "Type your message here...",
            newChatButtonText: "Send us a message"
            // Add other translations here if needed
        },
        it: {
            sendButtonText: "Invia",
            messagePlaceholder: "Scrivi qui il tuo messaggio...",
            newChatButtonText: "Inviaci un messaggio"
            // Aggiungi altre traduzioni qui se necessario
        }
    };

    let currentLanguage = 'en'; // Default language
    let i18nResources = {};

    function initializeI18n(options) {
        i18nResources = options.resources || {};
        let initialLocale = options.locale || 'en';

        if (i18nResources[initialLocale]) {
            currentLanguage = initialLocale;
        } else if (i18nResources['en']) { // Fallback to 'en' if specified locale not found
            currentLanguage = 'en';
            console.warn(`i18n: Initial locale '${initialLocale}' not found. Defaulting to 'en'.`);
        } else if (Object.keys(i18nResources).length > 0) { // Fallback to first available language
            currentLanguage = Object.keys(i18nResources)[0];
            console.warn(`i18n: Initial locale '${initialLocale}' and 'en' not found. Defaulting to first available: ${currentLanguage}.`);
        } else { // Absolute fallback if no resources (should not happen with predefined translations)
            currentLanguage = 'en';
            console.error(`i18n: No resources provided. Translations will likely fail.`);
        }
        console.log(`i18n: System initialized. Language: ${currentLanguage}`);
    }

    function t(key) {
        if (i18nResources[currentLanguage] && typeof i18nResources[currentLanguage][key] === 'string') {
            return i18nResources[currentLanguage][key];
        }
        const fallbackLang = 'en';
        if (i18nResources[fallbackLang] && typeof i18nResources[fallbackLang][key] === 'string') {
            console.warn(`i18n: Key '${key}' not found for language '${currentLanguage}'. Falling back to '${fallbackLang}'.`);
            return i18nResources[fallbackLang][key];
        }
        console.error(`i18n: Key '${key}' not found in '${currentLanguage}' or fallback '${fallbackLang}'.`);
        return key; // Return the key itself as a last resort
    }

    // Function to update UI text elements if language changes dynamically
    // Not called by default in this script after initial load, but available.
    function updateUIText() {
        if (!chatContainer) return; // Make sure chatContainer is defined

        const sendButtonEl = chatContainer.querySelector('.chat-input button[type="submit"]');
        if (sendButtonEl) sendButtonEl.textContent = t('sendButtonText');

        const textareaEl = chatContainer.querySelector('.chat-input textarea');
        if (textareaEl) textareaEl.placeholder = t('messagePlaceholder');

        const newChatBtnTextEl = chatContainer.querySelector('.new-chat-btn-text');
        if (newChatBtnTextEl) newChatBtnTextEl.textContent = t('newChatButtonText');
    }
    
    function setLanguage(lang) {
      if (i18nResources[lang]) {
        currentLanguage = lang;
        console.log(`i18n: Language changed to: ${currentLanguage}`);
      } else {
        console.warn(`i18n: Language '${lang}' not found in resources. Attempting fallback.`);
        if (i18nResources['en']) {
            currentLanguage = 'en';
            console.warn(`i18n: Fell back to English.`);
        } else if (Object.keys(i18nResources).length > 0) {
            currentLanguage = Object.keys(i18nResources)[0];
            console.warn(`i18n: Fell back to first available language: ${currentLanguage}.`);
        } else {
            currentLanguage = 'en';
            console.error(`i18n: No languages available in resources. Defaulting to 'en'.`);
        }
      }
      if (typeof chatContainer !== 'undefined' && chatContainer) {
          updateUIText(); // Update DOM elements if they exist
      }
    }
    // --- End i18n ---

    // Create and inject styles
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .n8n-chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
        }

        .n8n-chat-widget .chat-container.position-left {
            right: auto;
            left: 20px;
        }

        .n8n-chat-widget .chat-container.open {
            display: flex;
            flex-direction: column;
        }

        .n8n-chat-widget .brand-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            position: relative;
        }

        .n8n-chat-widget .close-button {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
            font-size: 20px;
            opacity: 0.6;
        }

        .n8n-chat-widget .close-button:hover {
            opacity: 1;
        }

        .n8n-chat-widget .brand-header img {
            width: 32px;
            height: 32px;
        }

        .n8n-chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }

        .n8n-chat-widget .new-conversation {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            text-align: center;
            width: 100%;
            max-width: 300px;
        }

        .n8n-chat-widget .welcome-text {
            font-size: 24px;
            font-weight: 600;
            color: var(--chat--color-font);
            margin-bottom: 24px;
            line-height: 1.3;
        }

        .n8n-chat-widget .new-chat-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.3s;
            font-weight: 500;
            font-family: inherit;
            margin-bottom: 12px;
        }

        .n8n-chat-widget .new-chat-btn:hover {
            transform: scale(1.02);
        }
        
        .n8n-chat-widget .new-chat-btn-text { /* Style for the text span inside the button */
            margin-left: 8px; /* Adjust as needed */
        }

        .n8n-chat-widget .message-icon {
            width: 20px;
            height: 20px;
            flex-shrink: 0; /* Prevent SVG from shrinking */
        }

        .n8n-chat-widget .response-text {
            font-size: 14px;
            color: var(--chat--color-font);
            opacity: 0.7;
            margin: 0;
        }

        .n8n-chat-widget .chat-interface {
            display: none;
            flex-direction: column;
            height: 100%;
        }

        .n8n-chat-widget .chat-interface.active {
            display: flex;
        }
        .n8n-chat-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--chat--color-background);
            display: flex;
            flex-direction: column;
        }

        .n8n-chat-widget .chat-message {
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
        }

        .n8n-chat-widget .chat-message.user {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            align-self: flex-end;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
            border: none;
        }

        .n8n-chat-widget .chat-message.bot {
            background: var(--chat--color-background);
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font);
            align-self: flex-start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .n8n-chat-widget .chat-input {
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
        }

        .n8n-chat-widget .chat-input textarea {
            flex: 1;
            padding: 12px;
            border: 1px solid rgba(133, 79, 255, 0.2);
            border-radius: 8px;
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            resize: none;
            font-family: inherit;
            font-size: 14px;
        }

        .n8n-chat-widget .chat-input textarea::placeholder {
            color: var(--chat--color-font);
            opacity: 0.6;
        }

        .n8n-chat-widget .chat-input button {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0 20px;
            cursor: pointer;
            transition: transform 0.2s;
            font-family: inherit;
            font-weight: 500;
        }

        .n8n-chat-widget .chat-input button:hover {
            transform: scale(1.05);
        }

        .n8n-chat-widget .chat-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
            z-index: 999;
            transition: transform 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .n8n-chat-widget .chat-toggle.position-left {
            right: auto;
            left: 20px;
        }

        .n8n-chat-widget .chat-toggle:hover {
            transform: scale(1.05);
        }

        .n8n-chat-widget .chat-toggle svg {
            width: 24px;
            height: 24px;
            fill: currentColor;
            position:absolute;
        }

        .n8n-chat-widget .chat-footer {
            padding: 8px;
            text-align: center;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
        }

        .n8n-chat-widget .chat-footer a {
            color: var(--chat--color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: inherit;
        }

        .n8n-chat-widget .chat-footer a:hover {
            opacity: 1;
        }
    `;
    // Load Geist font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Default configuration
    const defaultConfig = {
        webhook: {
            url: '',
            route: ''
        },
        branding: {
            logo: '',
            name: '',
            welcomeText: '', // These come from config, not i18n by default
            responseTimeText: '', // These come from config, not i18n by default
            poweredBy: {
                text: '',
                link: ''
            }
        },
        style: {
            primaryColor: '',
            secondaryColor: '',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        },
        lang: 'en', // Default language for i18n, can be overridden by userConfig
        autoStart: false,
        autoStartDelay: 10000
    };

    // Merge user config with defaults
    const userConfig = window.ChatWidgetConfig || {};
    const config = {
        webhook: { ...defaultConfig.webhook, ...(userConfig.webhook || {}) },
        branding: { ...defaultConfig.branding, ...(userConfig.branding || {}) },
        style: { ...defaultConfig.style, ...(userConfig.style || {}) },
        // Ensure lang is correctly picked up, defaulting to defaultConfig.lang ('en')
        lang: userConfig.lang !== undefined && userConfig.lang !== '' ? userConfig.lang : defaultConfig.lang,
        autoStart: userConfig.autoStart !== undefined ? userConfig.autoStart : defaultConfig.autoStart,
        autoStartDelay: userConfig.autoStartDelay !== undefined ? userConfig.autoStartDelay : defaultConfig.autoStartDelay
    };
    
    // Initialize i18n *after* config is merged, using config.lang
    initializeI18n({
        resources: translations, // Our defined translations
        locale: config.lang // Language from widget config (e.g., 'it' or 'en')
    });

    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    // Function to generate UUID
    function generateUUID() {
        return crypto.randomUUID();
    }

    // Initialize currentSessionId from localStorage or generate a new one
    let currentSessionId = localStorage.getItem('n8nChatWidgetSessionId');
    if (!currentSessionId) {
        currentSessionId = generateUUID();
        localStorage.setItem('n8nChatWidgetSessionId', currentSessionId);
    }

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    // Make chatContainer globally accessible within IIFE for updateUIText
    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;
    
    // Use t() for translatable strings in HTML
    const newConversationHTML = `
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <span>${config.branding.name}</span>
            <button class="close-button" aria-label="Close">×</button>
        </div>
        <div class="new-conversation">
            <h2 class="welcome-text">${config.branding.welcomeText || t('defaultWelcomeText', 'Welcome!')}</h2>
            <button class="new-chat-btn">
                <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
                </svg>
                <span class="new-chat-btn-text">${t('newChatButtonText')}</span>
            </button>
            <p class="response-text">${config.branding.responseTimeText || t('defaultResponseTimeText', 'Typically replies in a few minutes')}</p>
        </div>
    `;

    const chatInterfaceHTML = `
        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <button class="close-button" aria-label="Close">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="${t('messagePlaceholder')}" rows="1"></textarea>
                <button type="submit">${t('sendButtonText')}</button>
            </div>
            <div class="chat-footer">
                <!--<a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>-->
            </div>
        </div>
    `;
    
    chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;
    
    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.setAttribute('aria-label', 'Toggle chat'); // Accessibility
    toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>`;
    
    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]'); // This is already handled by t() in HTML

    async function startNewConversation() {
        const data = [{
            action: "loadPreviousSession",
            sessionId: currentSessionId,
            route: config.webhook.route,
            metadata: {
                userId: "",
                lang: config.lang, // Send current language to backend if needed
                pageTitle: document.title,
                pageUrl: window.location.href
            }
        }];

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();
            chatContainer.querySelector('.new-conversation').style.display = 'none';
            const initialBrandHeader = chatContainer.querySelector('.new-conversation').previousElementSibling;
            if (initialBrandHeader && initialBrandHeader.classList.contains('brand-header')) {
                initialBrandHeader.style.display = 'none';
            }
            
            chatInterface.classList.add('active');

            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.textContent = Array.isArray(responseData) ? responseData[0].output : responseData.output;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error starting new conversation:', error);
        }
    }

    async function sendMessage(message) {
        const messageData = {
            action: "sendMessage",
            sessionId: currentSessionId,
            route: config.webhook.route,
            chatInput: message,
            metadata: {
                userId: "",
                pageTitle: document.title,
                pageUrl: window.location.href,
                lang: config.lang // Send current language to backend
            }
        };

        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        textarea.value = ''; // Clear textarea immediately

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });
            
            const data = await response.json();
            
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.textContent = Array.isArray(data) ? data[0].output : data.output;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error sending message:', error);
            // Optionally display an error message to the user in the chat
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.className = 'chat-message bot error'; // Style this class for errors
            errorMessageDiv.textContent = 'Sorry, an error occurred. Please try again.';
            messagesContainer.appendChild(errorMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    if (newChatBtn) { // Check if element exists
        newChatBtn.addEventListener('click', startNewConversation);
    }
    
    if (sendButton) { // Check if element exists
        sendButton.addEventListener('click', () => {
            const message = textarea.value.trim();
            if (message) {
                sendMessage(message);
                // textarea.value = ''; // Moved to sendMessage for immediate clearing
            }
        });
    }
    
    if (textarea) { // Check if element exists
        textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = textarea.value.trim();
                if (message) {
                    sendMessage(message);
                    // textarea.value = ''; // Moved to sendMessage for immediate clearing
                }
            }
        });
    }
    
    if (toggleButton) { // Check if element exists
        toggleButton.addEventListener('click', () => {
            chatContainer.classList.toggle('open');
        });
    }

    const closeButtons = chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatContainer.classList.remove('open');
        });
    });

    if (config.autoStart && !sessionStorage.getItem('chatWidgetAutoStarted')) {
        setTimeout(() => {
            chatContainer.classList.add('open');
            if (!chatInterface.classList.contains('active') && newChatBtn) { // Ensure newChatBtn exists
                 // Check if the new conversation screen is visible
                const newConversationScreen = chatContainer.querySelector('.new-conversation');
                if (newConversationScreen && getComputedStyle(newConversationScreen).display !== 'none') {
                    startNewConversation();
                }
            }
            sessionStorage.setItem('chatWidgetAutoStarted', 'true');
        }, config.autoStartDelay);
    }
})();
