"use client";
import { useEffect } from 'react';

export default function ChatWidget() {
  useEffect(() => {
    // Check if script is already added
    if (document.getElementById('n8n-chat-script')) return;

    const script = document.createElement('script');
    script.id = 'n8n-chat-script';
    script.type = 'module';
    script.async = true;

    // n8n Chat Widget Loader
    // We will update the 'webhookUrl' below once we have it
    script.innerHTML = `
            import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.js';
            
            createChat({
                webhookUrl: 'REPLACE_WITH_YOUR_N8N_URL',
                target: '#n8n-chat',
                mode: 'window',
                showWelcomeScreen: true,
                defaultOpen: false,
                initialMessages: [
                    'Hi there! 👋',
                    'How can I help you find the perfect jewelry today?'
                ],
                i18n: {
                    en: {
                        title: 'Spark Support',
                        subtitle: 'Ask us anything about our collection',
                        getStarted: 'Chat with us',
                    }
                },
                style: {
                    width: '360px',
                    height: '500px',
                    position: 'fixed',
                    right: '20px',
                    bottom: '20px',
                    zIndex: '9999',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                }
            });
        `;

    // Create container if not exists (though createChat usually handles it, explicit styling helps)
    const style = document.createElement('style');
    style.innerHTML = `
      .n8n-chat-widget {
        --chat--color-primary: #B8860B!important; /* Brand Gold */
        --chat--color-secondary: #0A192F!important; /* Brand Navy */
        z-index: 10000!important;
        bottom: 24px!important;
        right: 24px!important;
        max-width: 400px!important;
        max-height: 80vh!important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15)!important;
      }
      /* Override for mobile */
      @media(max-width: 640px) {
        .n8n-chat-widget {
          width: 100%!important;
          right: 0!important;
          bottom: 0!important;
          border-radius: 16px 16px 0 0!important;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(script);

    return () => {
      // Optional cleanup
      // document.body.removeChild(script);
    };
  }, []);

  return null; // The widget injects itself into the DOM
}
