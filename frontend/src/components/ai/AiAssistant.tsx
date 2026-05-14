import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, X, Bot, Loader2, Volume2, VolumeX } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import './AiAssistant.css';

const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8000';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'error';
  text: string;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'ai',
      text: "Bonjour ! Je suis l'assistant vocal CIMR. Comment puis-je vous aider aujourd'hui ?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef<string>(uuidv4()).current;
  const [isScanning, setIsScanning] = useState(false);

  // Speech Recognition Setup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto-send after a brief delay
      setTimeout(() => {
        handleSend(transcript);
      }, 500);
    };
  }

  // Text to Speech
  const speak = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel(); // Stop any current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Attempt to find a French voice
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith('fr') && v.name.includes('Google')) 
                 || voices.find(v => v.lang.startsWith('fr'));
    if (frVoice) {
      utterance.voice = frVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // If the window is opened for the first time with speech enabled, we could speak the greeting
    if (isOpen && messages.length === 1 && speechEnabled) {
      speak(messages[0].text);
    }
  }, [isOpen]);

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      setInput('');
      recognition?.start();
    }
  };

  const handleSend = async (textToSent?: string) => {
    const text = textToSent || input.trim();
    if (!text) return;

    if (!textToSent) setInput('');
    window.speechSynthesis.cancel(); // Stop speaking when user sends a new message

    const userMessage: Message = { id: uuidv4(), type: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch(`${AI_API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, session_id: sessionId })
      });

      const data = await response.json();
      
      if (response.ok) {
        const aiMessage: Message = { id: uuidv4(), type: 'ai', text: data.response };
        setMessages(prev => [...prev, aiMessage]);
        speak(data.response);
      } else {
        throw new Error(data.message || "Erreur lors de la communication avec l'assistant.");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = { 
        id: uuidv4(), 
        type: 'error', 
        text: "Désolé, une erreur s'est produite lors de la connexion à l'assistant AI." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
 
  const handleScanClick = () => {
    fileInputRef.current?.click();
  };
 
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
 
    setIsScanning(true);
    setMessages(prev => [...prev, { id: uuidv4(), type: 'user', text: "[Scannage de CIN en cours...]" }]);
    setIsTyping(true);
 
    const formData = new FormData();
    formData.append('file', file);
 
    try {
      const response = await fetch(`${AI_API_URL}/api/ai/verify-id`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
 
      if (data.status === 'success') {
        const cin = data.extracted.cin;
        const name = data.extracted.full_name;
        
        let reply = `[RÉSULTAT ANALYSE] CIN: ${cin || 'Inconnu'} | NOM: ${name || 'Inconnu'}`;
        
        if (data.extracted.verified) {
             reply += "\n\nOUI - Vérification réussie ! Pour votre sécurité, veuillez utiliser le bouton 'Mot de passe oublié' sur l'écran de connexion pour définir votre nouveau mot de passe.";
        } else {
             reply += "\n\nNON - Échec de la vérification. L'identifiant saisi ne correspond pas aux informations de la carte extraites. Veuillez réessayer.";
        }
 
        const aiMessage: Message = { id: uuidv4(), type: 'ai', text: reply };
        setMessages(prev => [...prev, aiMessage]);
        speak(reply);
      } else {
        throw new Error("Échec de l'analyse OCR.");
      }
    } catch {
      setMessages(prev => [...prev, { id: uuidv4(), type: 'error', text: "Erreur lors du scan de la CIN." }]);
    } finally {
      setIsTyping(false);
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="ai-assistant-wrapper">
      <div className={`ai-chat-window ${!isOpen ? 'hidden' : ''}`}>
        <div className="ai-chat-header">
          <div className="ai-header-info">
            <div className="ai-avatar">
              <Bot size={24} color="#3b82f6" />
            </div>
            <div>
              <h3 className="ai-title">CIMR Assistant</h3>
              <div className="ai-status">
                <span className="ai-status-dot"></span> En ligne
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="speech-controls">
          <span>Sortie vocale</span>
          <button 
            className="toggle-speech" 
            onClick={() => {
              setSpeechEnabled(!speechEnabled);
              if (speechEnabled) window.speechSynthesis.cancel();
            }}
            style={{ border: 'none', background: 'transparent' }}
          >
            {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {speechEnabled ? 'Activée' : 'Désactivée'}
          </button>
        </div>

        <div className="ai-chat-body">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.type}`}>
              {msg.text}
            </div>
          ))}
          
          {isTyping && (
            <div className="chat-message ai">
              <div className="typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-chat-footer">
          {recognition && (
            <button 
              className={`voice-btn ${isListening ? 'listening' : ''}`} 
              onClick={toggleListen}
              title={isListening ? "Arrêter l'écoute" : "Parler"}
            >
              {isListening ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}
            </button>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <button 
            className="voice-btn" 
            onClick={handleScanClick}
            title="Scanner CIN"
            disabled={isScanning || isTyping}
          >
            <Bot size={20} />
          </button>
          
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Je vous écoute..." : "Posez une question..."}
            disabled={isTyping}
          />
          
          <button 
            className="send-btn" 
            onClick={() => handleSend()}
            disabled={(!input.trim() && !isListening) || isTyping}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {!isOpen && (
        <button 
          className="ai-toggle-btn glowing" 
          onClick={() => setIsOpen(true)}
          title="Ouvrir l'assistant CIMR"
        >
          <Bot size={32} />
        </button>
      )}
    </div>
  );
}
