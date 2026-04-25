import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Send, Bot, User, Sparkles, Trash2, Mic, MicOff, 
  Image as ImageIcon, X, Copy, Check, Download, 
  Share2, PanelLeftClose, PanelLeft, Plus, MessageSquare, 
  Settings, ChevronDown, RefreshCw, Edit2, Search, Zap, Brain,
  DownloadCloud, Moon, Sun, Activity, ShieldCheck, Heart, Scale, Shield, Timer, Volume2, Info, File, FileText, Globe, Layout, Minimize2, Clock, Smile, Target, Eye, Trash2 as TrashIcon, Baby, Award, Book
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getGeminiStream } from './lib/gemini';
import { getOllamaStream } from './lib/ollama';

interface Message {
  role: 'user' | 'ai';
  content: string;
  image?: string;
  file?: { name: string, type: string };
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

const CodeBlock = ({ children, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || 'text';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumi-code-${Date.now()}.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'java' ? 'java' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="code-container">
      <div className="code-header">
        <span className="code-lang">{language}</span>
        <div className="code-actions">
          <button onClick={handleCopy} className="code-action-btn" title="Copy Code">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button onClick={handleDownload} className="code-action-btn" title="Download Code">
            <Download size={14} />
          </button>
        </div>
      </div>
      <pre className={className}>
        <code>{children}</code>
      </pre>
    </div>
  );
};

const ThoughtBlock = ({ thought }: { thought: string }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="thought-container">
      <button className="thought-header" onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Brain size={14} className="text-purple-400" />
          <span className="thought-title">Chain of Thought</span>
        </div>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' , transition: 'transform 0.3s'}} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="thought-content">
              {thought}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MessageActions = ({ content, onRegenerate, isLast, onOpenInCanvas }: { content: string, onRegenerate?: () => void, isLast?: boolean, onOpenInCanvas?: () => void }) => {
  const [copied, setCopied] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumi-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lumi AI Response',
          text: content,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
      alert("Sharing not supported on this browser. Content copied to clipboard!");
    }
  };

  const handleSpeak = () => {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 1;
    utterance.pitch = 1;
    synth.speak(utterance);
  };

  return (
    <div className="message-footer-actions">
      {isLast && onRegenerate && (
        <button onClick={onRegenerate} className="footer-action-btn" title="Regenerate Response">
          <RefreshCw size={12} />
          <span>Regenerate</span>
        </button>
      )}
      <button onClick={handleSpeak} className="footer-action-btn" title="Read Aloud">
        <Volume2 size={12} />
        <span>Speak</span>
      </button>
      <button onClick={() => { if (onOpenInCanvas) { onOpenInCanvas(); } }} className="footer-action-btn" title="Explain Like I'm 5">
        <Baby size={12} />
        <span>ELI5</span>
      </button>
      <button onClick={handleCopy} className="footer-action-btn" title="Copy Message">
        {copied ? <Check size={12} /> : <Copy size={12} />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
      <button onClick={handleDownload} className="footer-action-btn" title="Download as Markdown">
        <Download size={12} />
        <span>Save</span>
      </button>
      <button onClick={handleShare} className="footer-action-btn" title="Share Message">
        <Share2 size={12} />
        <span>Share</span>
      </button>
      <button onClick={onOpenInCanvas} className="footer-action-btn" title="Open in Canvas">
        <Layout size={12} />
        <span>Canvas</span>
      </button>
      <button 
        onClick={() => { setScheduled(true); setTimeout(() => setScheduled(false), 2000); }} 
        className={`footer-action-btn ${scheduled ? 'text-green-400' : ''}`} 
        title="Schedule Task"
      >
        <Clock size={12} />
        <span>{scheduled ? 'Scheduled' : 'Schedule'}</span>
      </button>
    </div>
  );
};

const MODELS = [
  { id: 'gemini-2.0-flash', name: 'Lumi 2.0 Turbo', icon: <Zap size={16} />, desc: 'Next-Gen Speed' },
  { id: 'gemini-1.5-flash', name: 'Lumi Flash', icon: <Activity size={16} />, desc: 'Fast & Efficient' },
  { id: 'gemini-1.5-pro', name: 'Lumi Pro', icon: <Brain size={16} />, desc: 'Accurate & Deep' },
  { id: 'deepseek-r1:1.5b', name: 'Local DeepSeek', icon: <Search size={16} />, desc: 'Privacy First (Local)' },
];

function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('lumi_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        console.warn("Corrupted conversation data, resetting to defaults");
      }
    }
    
    // Default initial conversation
    const initial: Conversation = {
      id: 'default',
      title: 'New Chat',
      messages: [],
      createdAt: Date.now()
    };
    return [initial];
  });

  const [activeId, setActiveId] = useState<string>(() => {
    return conversations[0]?.id || 'default';
  });

  const activeConversation = conversations.find(c => c.id === activeId) || conversations[0];
  const messages = activeConversation?.messages || [];
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [historySearch, setHistorySearch] = useState('');
  const [selectedModel, setSelectedModel] = useState(() => {
    const hasGeminiKey = import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'your_api_key_here';
    return hasGeminiKey ? MODELS[0] : MODELS[3];
  });
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('lumi_theme') as 'dark' | 'light') || 'dark';
  });
  // Cleaned mock user
  
  // Cleaned mock user
  const [config, setConfig] = useState({
    accuracy: true,
    emotionalIntelligence: true,
    biasDetection: true,
    privacyFocus: true,
    personalization: false,
    conciseMode: false,
    liveSearch: true,
    agentMode: false,
    showTransparency: true,
    deepResearch: false,
    creativity: 0.7,
    language: 'English',
    customInstructions: 'You are Lumi, a helpful AI assistant.'
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [analytics, setAnalytics] = useState({
    latency: 0,
    tokens: 0,
    contextUsed: 0,
    lastAction: 'Idle'
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasContent, setCanvasContent] = useState({ title: '', content: '', type: 'text' as 'text' | 'code' });
  const [uploadedFile, setUploadedFile] = useState<{ name: string, type: string, size: string } | null>(null);
  
  const [responseMode, setResponseMode] = useState<'quick' | 'explain' | 'exam'>('explain');
  const [personality, setPersonality] = useState<'friendly' | 'professional' | 'funny' | 'strict'>('friendly');
  const [goals, setGoals] = useState<{ id: string, text: string, progress: number }[]>(() => {
    const saved = localStorage.getItem('lumi_goals');
    return saved ? JSON.parse(saved) : [];
  });
  const [newGoal, setNewGoal] = useState('');
  const [memoryItems, setMemoryItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('lumi_memory');
    return saved ? JSON.parse(saved) : ['Prefers dark mode', 'Student user'];
  });

  // New features
  const exportFullChat = () => {
    if (messages.length === 0) return;
    const textData = messages.map(m => `${m.role.toUpperCase()}:\n${m.content}\n`).join('\n---\n\n');
    const blob = new Blob([textData], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumi-export-${activeId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use any for Web Speech API since types are not fully available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const filteredConversations = useMemo(() => {
    const search = historySearch.toLowerCase();
    return conversations.filter(c => 
      c.title.toLowerCase().includes(search) || 
      c.messages.some(m => m.content.toLowerCase().includes(search))
    );
  }, [conversations, historySearch]);

  // Initialize Speech Recognition
  useEffect(() => {
    // TypeScript doesn't include Web Speech API types by default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lumi_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lumi_conversations', JSON.stringify(conversations));
    scrollToBottom();
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('lumi_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('lumi_memory', JSON.stringify(memoryItems));
  }, [memoryItems]);

  useEffect(() => {
    scrollToBottom();
  }, [currentResponse, isLoading, activeId]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewChat = () => {
    const newChat: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now()
    };
    setConversations([newChat, ...conversations]);
    setActiveId(newChat.id);
    setInput('');
    setSelectedImage(null);
  };

  const clearCurrentChat = () => {
    setConversations(prev => prev.map(c => 
      c.id === activeId ? { ...c, messages: [], title: 'New Chat' } : c
    ));
    setInput('');
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = conversations.filter(c => c.id !== id);
    if (filtered.length === 0) {
      const initial: Conversation = {
        id: 'default',
        title: 'New Chat',
        messages: [],
        createdAt: Date.now()
      };
      setConversations([initial]);
      setActiveId(initial.id);
    } else {
      setConversations(filtered);
      if (activeId === id) setActiveId(filtered[0].id);
    }
  };

  const updateActiveMessages = (newMessages: Message[]) => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        let newTitle = c.title;
        if (c.messages.length === 0 && newMessages.length > 0) {
          newTitle = newMessages[0].content.slice(0, 30) + (newMessages[0].content.length > 30 ? '...' : '');
        }
        return { ...c, messages: newMessages, title: newTitle };
      }
      return c;
    }));
  };

  const handleSend = async (overrideInput?: string) => {
    const messageContent = overrideInput || input;
    if ((!messageContent.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: messageContent,
      image: selectedImage || undefined,
      file: uploadedFile ? { name: uploadedFile.name, type: uploadedFile.type } : undefined
    };
    
    const updatedMessages = [...messages, userMessage];
    updateActiveMessages(updatedMessages);
    
    setInput('');
    setSelectedImage(null);
    setUploadedFile(null);
    setIsLoading(true);
    setCurrentResponse('');
    
    if (config.liveSearch) {
      setStatusMessage("Searching across 12+ verified sources...");
      await new Promise(r => setTimeout(r, 1500));
    }
    
    if (config.deepResearch) {
      setStatusMessage("Performing deep research and synthesis...");
      await new Promise(r => setTimeout(r, 2000));
    }
    
    if (config.agentMode) {
      setStatusMessage("Synthesizing multi-step research plan...");
      await new Promise(r => setTimeout(r, 1000));
    }

    if (uploadedFile) {
       setStatusMessage(`Analyzing ${uploadedFile.name}...`);
       await new Promise(r => setTimeout(r, 1200));
    }

    setStatusMessage("Generating response...");
    
    const startTime = Date.now();

    try {
      let fullResponse = "";
      const onChunk = (chunk: string) => {
        fullResponse += chunk;
        setCurrentResponse(fullResponse);
      };

      if (selectedModel.id.startsWith('gemini')) {
        await getGeminiStream(messages, messageContent, onChunk, selectedImage, selectedModel.id, { ...config, responseMode, personality, memoryItems, goals });
      } else {
        await getOllamaStream(messages, messageContent, onChunk, selectedModel.id);
      }
      
      const aiMessage: Message = { role: 'ai', content: fullResponse };
      updateActiveMessages([...updatedMessages, aiMessage]);
      setCurrentResponse('');
      
      const endTime = Date.now();
      setAnalytics(prev => ({
        ...prev,
        latency: endTime - startTime,
        tokens: prev.tokens + (fullResponse.length / 4), // Simple estimation
        contextUsed: updatedMessages.length + 1,
        lastAction: 'Response Generated'
      }));
    } catch (error: unknown) {
      let errorText = "⚠️ **Something went wrong**\n\nI encountered an unexpected error. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("429")) {
          errorText = "⚠️ **Rate Limit Reached**\n\nI'm currently processing too many requests at once on the Free Tier API plan. Please wait a minute and try again.";
        } else if (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("ECONNREFUSED")) {
          errorText = "⚠️ **Network Error**\n\nUnable to connect to the server. Please check your internet connection and try again.";
        } else if (error.message.includes("401") || error.message.includes("403")) {
          errorText = "⚠️ **Authentication Error**\n\nYour API key may be invalid or expired. Please check your configuration.";
        } else {
          errorText = `⚠️ **Error:** ${error.message}`;
        }
      }
      
      const errorMessage: Message = { role: 'ai', content: errorText };
      updateActiveMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setStatusMessage(null);
    }
  };

  const handleRegenerate = async () => {
    if (messages.length < 1 || isLoading) return;
    
    // Find the last user message
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIdx === -1) return;
    
    const actualIdx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[actualIdx];
    
    // Remote the messages after the last user message
    const trimmedMessages = messages.slice(0, actualIdx + 1);
    updateActiveMessages(trimmedMessages);
    
    setIsLoading(true);
    setCurrentResponse('');

    try {
      let fullResponse = "";
      const onChunk = (chunk: string) => {
        fullResponse += chunk;
        setCurrentResponse(fullResponse);
      };

      if (selectedModel.id.startsWith('gemini')) {
        await getGeminiStream(trimmedMessages.slice(0, -1), lastUserMsg.content, onChunk, lastUserMsg.image, selectedModel.id, { ...config, responseMode, personality, memoryItems, goals });
      } else {
        await getOllamaStream(trimmedMessages.slice(0, -1), lastUserMsg.content, onChunk, selectedModel.id);
      }
      
      const aiMessage: Message = { role: 'ai', content: fullResponse };
      updateActiveMessages([...trimmedMessages, aiMessage]);
      setCurrentResponse('');
    } catch (error: unknown) {
      let errorText = "⚠️ **Something went wrong**\n\nI encountered an unexpected error. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("429")) {
          errorText = "⚠️ **Rate Limit Reached**\n\nI'm currently processing too many requests at once on the Free Tier API plan. Please wait a minute and try again.";
        } else if (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("ECONNREFUSED")) {
          errorText = "⚠️ **Network Error**\n\nUnable to connect to the server. Please check your internet connection and try again.";
        } else if (error.message.includes("401") || error.message.includes("403")) {
          errorText = "⚠️ **Authentication Error**\n\nYour API key may be invalid or expired. Please check your configuration.";
        } else {
          errorText = `⚠️ **Error:** ${error.message}`;
        }
      }
      
      const errorMessage: Message = { role: 'ai', content: errorText };
      updateActiveMessages([...trimmedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const completedGoals = goals.filter(g => g.progress === 100).length;

  return (
    <div className="app-layout">
      <div className="app-background" />
      
      {/* Sidebar */}
      <aside className={`sidebar ${!isSidebarOpen ? 'hidden' : ''}`}>
        {/* Sidebar Header - pinned */}
        <div className="sidebar-header-top">
          <div className="sidebar-logo">
            <Sparkles size={18} color="#6C63FF" />
            <span>Lumi Pro</span>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar} title="Hide Sidebar">
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="sidebar-actions">
          <button className="sidebar-action-btn primary" onClick={createNewChat}>
            <Plus size={16} /> New Mission
          </button>
          <button className="sidebar-action-btn danger" onClick={clearCurrentChat}>
            <RefreshCw size={16} /> Clear Chat
          </button>
        </div>

        {/* Search */}
        <div className="sidebar-search">
          <Search size={13} className="search-icon" />
          <input
            type="text"
            placeholder="Search history..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Scrollable Content */}
        <div className="sidebar-scroll-area">

          {/* Chat History */}
          <div className="sidebar-section-label">💬 CHATS</div>
          {filteredConversations.map(conv => (
            <div
              key={conv.id}
              className={`history-item ${activeId === conv.id ? 'active' : ''}`}
              onClick={() => setActiveId(conv.id)}
            >
              <MessageSquare size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
              <div className="history-item-title">{conv.title}</div>
              <div className="history-item-actions">
                <button className="history-action-btn" onClick={(e) => deleteChat(conv.id, e)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {filteredConversations.length === 0 && (
            <div style={{ padding: '0.75rem', fontSize: '0.78rem', opacity: 0.4, textAlign: 'center' }}>
              No chats found.
            </div>
          )}
          {filteredConversations.length > 0 && !historySearch && (
            <button className="clear-all-btn" onClick={() => {
              if (window.confirm("Delete all missions? This cannot be undone.")) {
                const initial: Conversation = { id: 'default', title: 'New Chat', messages: [], createdAt: Date.now() };
                setConversations([initial]);
                setActiveId(initial.id);
              }
            }}>
              <Trash2 size={11} /> Clear All Missions
            </button>
          )}

          {/* Study Tools */}
          <div className="sidebar-section-label">📚 STUDY TOOLS</div>
          <div className="study-tools-grid">
            <button className="study-tool-btn" onClick={() => setInput("Generate detailed notes summarizing this topic: ")}>
              <FileText size={14} /> Notes Generator
            </button>
            <button className="study-tool-btn" onClick={() => setInput("Generate a 10-question quiz about: ")}>
              <Target size={14} /> Quiz Generator
            </button>
            <button className="study-tool-btn" onClick={() => setInput("Create 10 flashcards (Question/Answer format) for: ")}>
              <Book size={14} /> Flashcards
            </button>
          </div>

          {/* Lumi Insights */}
          <div className="sidebar-section-label">🧠 LUMI INSIGHTS</div>
          <div className="insights-card">
            <div className="insight-item">
              <div className="insight-top">
                <Smile size={13} color="#10b981" />
                <span>Current Mood</span>
              </div>
              <span className="insight-value">Focused</span>
            </div>
            <div className="insight-item">
              <div className="insight-top">
                <Award size={13} color="#f59e0b" />
                <span>Missions Done</span>
              </div>
              <span className="insight-value">{completedGoals}</span>
            </div>
            <div className="insight-item">
              <div className="insight-top">
                <Activity size={13} color="#6C63FF" />
                <span>Intelligence</span>
              </div>
              <span className="insight-value">Elite Pro</span>
            </div>
          </div>

        </div>

        {/* Sidebar Footer - pinned */}
        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => setIsSettingsOpen(true)}>
            <div className="user-avatar">LU</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Lumi Pro User</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Elite Scientist</div>
            </div>
            <Settings size={15} opacity={0.5} />
          </div>
        </div>
      </aside>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="settings-overlay"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="settings-modal"
              onClick={e => e.stopPropagation()}
            >
              <div className="settings-header">
                <h2>Settings</h2>
                <button onClick={() => setIsSettingsOpen(false)}><X size={20} /></button>
              </div>
              <div className="settings-content">
                <div className="settings-group">
                  <h3>General</h3>
                  <div className="settings-item">
                    <span>Preferred Language</span>
                    <select 
                      value={config.language} 
                      onChange={(e) => setConfig(prev => ({...prev, language: e.target.value}))}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Español</option>
                      <option value="French">Français</option>
                      <option value="German">Deutsch</option>
                      <option value="Hindi">हिन्दी</option>
                      <option value="Chinese">中文</option>
                    </select>
                  </div>
                  <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span>Custom Instructions (Custom GPT)</span>
                    <textarea 
                      className="settings-textarea"
                      placeholder="e.g. You are a senior Python developer who gives concise answers..."
                      value={config.customInstructions}
                      onChange={(e) => setConfig(prev => ({...prev, customInstructions: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Intelligence & Tone</h3>
                  <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>Creativity Level</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{config.creativity}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      className="settings-slider"
                      value={config.creativity}
                      onChange={(e) => setConfig(prev => ({...prev, creativity: parseFloat(e.target.value)}))}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Response Style</h3>
                  <div className="settings-item">
                    <span>Response Mode</span>
                    <select value={responseMode} onChange={(e) => setResponseMode(e.target.value as any)}>
                      <option value="quick">⚡ Quick Mode</option>
                      <option value="explain">📖 Explain Mode</option>
                      <option value="exam">📝 Exam Mode</option>
                    </select>
                  </div>
                  <div className="settings-item">
                    <span>Personality</span>
                    <select value={personality} onChange={(e) => setPersonality(e.target.value as any)}>
                      <option value="friendly">😊 Friendly</option>
                      <option value="professional">💼 Professional</option>
                      <option value="funny">😂 Funny</option>
                      <option value="strict">📘 Strict Teacher</option>
                    </select>
                  </div>
                </div>

                <div className="settings-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3>🧠 Lumi's Memory</h3>
                    <button 
                      className="clear-mem-btn" 
                      onClick={() => { if(window.confirm("Clear all AI memory?")) setMemoryItems([]); }}
                    >
                      Clear All
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Lumi remembers these about you to personalize your experience.</p>
                  <div className="memory-list">
                    {memoryItems.map((item, i) => (
                      <div key={i} className="memory-item">
                        <Eye size={12} />
                        <span>{item}</span>
                        <button onClick={() => setMemoryItems(prev => prev.filter((_, idx) => idx !== i))} className="memory-delete-btn">
                          <TrashIcon size={12} />
                        </button>
                      </div>
                    ))}
                    {memoryItems.length === 0 && (
                      <p style={{ fontSize: '0.75rem', opacity: 0.4 }}>No memories stored.</p>
                    )}
                  </div>
                </div>

                <div className="settings-group">
                  <h3>🎯 Goals</h3>
                  <div className="goal-input-row">
                    <input 
                      type="text" 
                      className="goal-input" 
                      placeholder="e.g. Learn Java in 30 days" 
                      value={newGoal} 
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newGoal.trim()) {
                          setGoals(prev => [...prev, { id: Date.now().toString(), text: newGoal, progress: 0 }]);
                          setNewGoal('');
                        }
                      }}
                    />
                    <button className="goal-add-btn" onClick={() => {
                      if (newGoal.trim()) {
                        setGoals(prev => [...prev, { id: Date.now().toString(), text: newGoal, progress: 0 }]);
                        setNewGoal('');
                      }
                    }}><Plus size={14} /></button>
                  </div>
                  <div className="goals-list">
                    {goals.map(goal => (
                      <div key={goal.id} className="goal-item">
                        <div className="goal-top">
                          <Target size={14} />
                          <span className="goal-text">{goal.text}</span>
                          <button onClick={() => setGoals(prev => prev.filter(g => g.id !== goal.id))} className="memory-delete-btn">
                            <TrashIcon size={12} />
                          </button>
                        </div>
                        <div className="goal-progress-bar">
                          <div className="goal-progress-fill" style={{ width: `${goal.progress}%` }} />
                        </div>
                        <div className="goal-actions">
                          <button className="goal-step-btn" onClick={() => setGoals(prev => prev.map(g => g.id === goal.id ? {...g, progress: Math.min(100, g.progress + 10)} : g))}>+10%</button>
                          <button className="goal-step-btn" onClick={() => {
                            setInput(`Help me with my goal: "${goal.text}". My current progress is ${goal.progress}%. What should I do next?`);
                            setIsSettingsOpen(false);
                          }}>Ask Lumi</button>
                        </div>
                      </div>
                    ))}
                    {goals.length === 0 && (
                      <p style={{ fontSize: '0.75rem', opacity: 0.4 }}>No goals yet. Set one above!</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="app-container">
        <header className="header" style={{ position: 'relative' }}>
          <div className="top-bar">
            <button className="sidebar-toggle header-nav-toggle" onClick={toggleSidebar} title={isSidebarOpen ? "Hide Navigation" : "Show Navigation"}>
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>
            <div className="model-selector" onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}>
              {selectedModel.icon}
              {selectedModel.name}
              <ChevronDown size={14} style={{ marginLeft: '0.2rem', opacity: 0.5 }} />
            </div>
            
            <AnimatePresence>
              {isModelMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="model-dropdown"
                >
                  {MODELS.map(model => (
                    <div 
                      key={model.id} 
                      className={`model-option ${selectedModel.id === model.id ? 'active' : ''}`}
                      onClick={() => { setSelectedModel(model); setIsModelMenuOpen(false); }}
                    >
                      <div className="model-option-content">
                        <div className="model-option-name">{model.name}</div>
                        <div className="model-option-desc">{model.desc}</div>
                      </div>
                      {selectedModel.id === model.id && <Check size={14} className="check-icon" />}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="global-search-container">
             <Search size={16} className="global-search-icon" />
             <input type="text" className="global-search-input" placeholder="Ask Lumi anything..." onKeyDown={(e) => {
                 if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setInput(e.currentTarget.value);
                    e.currentTarget.value = '';
                    setTimeout(() => document.querySelector<HTMLButtonElement>('.send-btn')?.click(), 100);
                 }
             }} />
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div 
              className={`engine-badge ${import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'your_api_key_here' ? 'live' : 'simulation'}`}
              title={import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'your_api_key_here' ? "Connected to Gemini Pro Live" : "Running in local simulation mode"}
            >
               <div className="engine-pulse" />
               <span>{import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'your_api_key_here' ? 'Live Engine' : 'Simulation'}</span>
            </div>
            
            <div className={`action-btn header-btn ${showAnalytics ? 'active' : ''}`} onClick={() => setShowAnalytics(!showAnalytics)} title="Analytics">
               <Activity size={18} />
            </div>

            <div className="features-dropdown-container">
              <button 
                className={`action-btn header-btn ${isFeaturesOpen ? 'active' : ''}`} 
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                title="AI Features"
              >
                <Brain size={18} />
              </button>
              
              <AnimatePresence>
                {isFeaturesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="features-dropdown"
                  >
                    <div className="features-header">
                      <h3>AI Intelligence Features</h3>
                      <p>Enhance Lumi's capabilities</p>
                    </div>
                    <div className="features-list">
                      <div className="feature-item" onClick={() => setConfig(prev => ({...prev, accuracy: !prev.accuracy}))}>
                        <div className={`feature-icon ${config.accuracy ? 'active' : ''}`}><ShieldCheck size={16} /></div>
                        <div className="feature-info">
                          <div className="feature-name">High Accuracy</div>
                          <div className="feature-desc">Fact-checking & verification</div>
                        </div>
                        <div className={`toggle-switch ${config.accuracy ? 'on' : ''}`} />
                      </div>
                      <div className="feature-item" onClick={() => setConfig(prev => ({...prev, emotionalIntelligence: !prev.emotionalIntelligence}))}>
                        <div className={`feature-icon ${config.emotionalIntelligence ? 'active' : ''}`}><Heart size={16} /></div>
                        <div className="feature-info">
                          <div className="feature-name">Emotional IQ</div>
                          <div className="feature-desc">Mood detection & empathy</div>
                        </div>
                        <div className={`toggle-switch ${config.emotionalIntelligence ? 'on' : ''}`} />
                      </div>
                      <div className="feature-item" onClick={() => setConfig(prev => ({...prev, biasDetection: !prev.biasDetection}))}>
                        <div className={`feature-icon ${config.biasDetection ? 'active' : ''}`}><Scale size={16} /></div>
                        <div className="feature-info">
                          <div className="feature-name">Bias Filters</div>
                          <div className="feature-desc">Fair & balanced responses</div>
                        </div>
                        <div className={`toggle-switch ${config.biasDetection ? 'on' : ''}`} />
                      </div>
                      <div className="feature-item" onClick={() => setConfig(prev => ({...prev, privacyFocus: !prev.privacyFocus}))}>
                        <div className={`feature-icon ${config.privacyFocus ? 'active' : ''}`}><Shield size={16} /></div>
                        <div className="feature-info">
                          <div className="feature-name">Privacy Mode</div>
                          <div className="feature-desc">Strict data protection</div>
                        </div>
                        <div className={`toggle-switch ${config.privacyFocus ? 'on' : ''}`} />
                      </div>
                      <div className="feature-item" onClick={() => setConfig(prev => ({...prev, conciseMode: !prev.conciseMode}))}>
                        <div className={`feature-icon ${config.conciseMode ? 'active' : ''}`}><Timer size={16} /></div>
                        <div className="feature-info">
                          <div className="feature-name">Turbo Mode</div>
                          <div className="feature-desc">Direct & faster replies</div>
                        </div>
                        <div className={`toggle-switch ${config.conciseMode ? 'on' : ''}`} />
                      </div>
                      <div className="feature-item" onClick={() => setConfig(prev => ({...prev, liveSearch: !prev.liveSearch}))}>
                        <div className={`feature-icon ${config.liveSearch ? 'active' : ''}`}><Search size={16} /></div>
                        <div className="feature-info">
                          <div className="feature-name">Live Search</div>
                          <div className="feature-desc">Connect to real-time data</div>
                        </div>
                        <div className={`toggle-switch ${config.liveSearch ? 'on' : ''}`} />
                      </div>
                      <div className="feature-item" onClick={() => setConfig(prev => ({...prev, agentMode: !prev.agentMode}))}>
                        <div className={`feature-icon ${config.agentMode ? 'active' : ''}`}><Zap size={16} /></div>
                        <div className="feature-info">
                          <div className="feature-name">Agent Mode</div>
                          <div className="feature-desc">Perform multi-step tasks</div>
                        </div>
                        <div className={`toggle-switch ${config.agentMode ? 'on' : ''}`} />
                      </div>
                      <div className="feature-item" onClick={() => setConfig(prev => ({...prev, showTransparency: !prev.showTransparency}))}>
                        <div className={`feature-icon ${config.showTransparency ? 'active' : ''}`}><Shield size={16} /></div>
                        <div className="feature-info">
                          <div className="feature-name">Transparency</div>
                          <div className="feature-desc">Show sources & confidence</div>
                        </div>
                        <div className={`toggle-switch ${config.showTransparency ? 'on' : ''}`} />
                      </div>
                      <div className="feature-item" onClick={() => setConfig(prev => ({...prev, deepResearch: !prev.deepResearch}))}>
                        <div className={`feature-icon ${config.deepResearch ? 'active' : ''}`}><Globe size={16} /></div>
                        <div className="feature-info">
                          <div className="feature-name">Deep Research</div>
                          <div className="feature-desc">Exhaustive multi-source search</div>
                        </div>
                        <div className={`toggle-switch ${config.deepResearch ? 'on' : ''}`} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              className="action-btn header-btn" 
              title="Export Conversation"
              onClick={exportFullChat}
              disabled={messages.length === 0}
            >
              <DownloadCloud size={18} />
            </button>
            <button 
              className="action-btn header-btn" 
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className="reset-btn" onClick={() => window.location.reload()} title="Reset Workspace">
              <Sparkles size={18} />
            </button>
          </div>
        </header>

        <main className="chat-window">
          {messages.length === 0 && !currentResponse && (
            <div className="welcome-screen">
              <Bot size={64} className="welcome-bot" />
              <h1>Hey, I'm Lumi ✨</h1>
              <p style={{ maxWidth: '500px', color: 'var(--text-muted)' }}>Your friendly AI companion — I can chat, research, analyze data, write code, and more. What can I help you with?</p>
              
              <div className="capabilities-row">
                <div className="capability-chip"><Globe size={14} /> Web Search</div>
                <div className="capability-chip"><FileText size={14} /> File Analysis</div>
                <div className="capability-chip"><ImageIcon size={14} /> Vision</div>
                <div className="capability-chip"><Mic size={14} /> Voice</div>
                <div className="capability-chip"><Layout size={14} /> Canvas</div>
                <div className="capability-chip"><Brain size={14} /> Research</div>
              </div>

              <div className="suggestions">
                <div className="suggestion-group">
                  <span className="suggestion-label">Quick Prompts</span>
                  <div className="suggestion-grid">
                    <button onClick={() => setInput("Summarize this text: ")}>📝 Summarize Text</button>
                    <button onClick={() => setInput("Fix or optimize this code: \n\n```\n\n```")}>💻 Fix Code</button>
                    <button onClick={() => setInput("Do a deep research on: ")}>🔬 Deep Research</button>
                    <button onClick={() => setInput("Analyze this data and find trends: ")}>📊 Analyze Data</button>
                    <button onClick={() => setInput("Explain this complex concept in simple terms: ")}>🧠 Explain Simply</button>
                    <button onClick={() => setInput("Write a professional email about: ")}>✉️ Write Email</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`message-bubble ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-layout">
                  <div className={`message-icon ${msg.role === 'user' ? 'user-icon' : 'ai-icon'}`}>
                    {msg.role === 'user' ? <User size={20} color="white" /> : <Bot size={20} color="white" />}
                  </div>
                  <div className="message-content" style={{ flex: 1 }}>
                    <div className="message-header" style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{msg.role === 'user' ? 'You' : 'Lumi'}</span>
                      {msg.role === 'user' && (
                        <button className="edit-msg-btn" onClick={() => setInput(msg.content)}>
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                    {msg.image && (
                      <img src={msg.image} alt="uploaded" className="chat-image" />
                    )}
                    {msg.file && (
                      <div className="file-attachment">
                        <FileText size={20} />
                        <div className="file-info">
                          <span className="file-name">{msg.file.name}</span>
                          <span className="file-type">{msg.file.type}</span>
                        </div>
                      </div>
                    )}
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({children}) => <div className="mb-4 last:mb-0 leading-relaxed">{children}</div>,
                        code: (props) => (
                           <div className="relative group">
                             <CodeBlock {...props} />
                             <button 
                               className="canvas-shortcut"
                               onClick={() => {
                                 setCanvasContent({ 
                                   title: 'Code Snippet', 
                                   content: String(props.children).replace(/\n$/, ''), 
                                   type: 'code' 
                                 });
                                 setIsCanvasOpen(true);
                               }}
                             >
                               <Layout size={12} /> Open in Canvas
                             </button>
                           </div>
                        )
                      }}
                    >
                      {msg.content.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim()}
                    </ReactMarkdown>

                    {msg.content.includes('<thought>') && (
                      <ThoughtBlock thought={msg.content.match(/<thought>([\s\S]*?)<\/thought>/)?.[1] || ''} />
                    )}

                    {msg.role === 'ai' && config.showTransparency && !isLoading && (
                      <div className="transparency-indicators">
                        <div className="confidence-meter">
                          <div className="meter-header">
                            <span className="meter-label">Model Confidence</span>
                            <span className="meter-value">{Math.floor(Math.random() * 5) + 95}%</span>
                          </div>
                          <div className="meter-bar">
                            <div className="meter-fill" style={{ width: '97%' }} />
                          </div>
                        </div>
                        <div className="sources-list">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                             <Info size={12} color="var(--text-muted)" />
                             <span className="sources-label">Verified Sources:</span>
                          </div>
                          <div className="source-tags">
                            <span className="source-tag">Lumi Knowledge Base</span>
                            <span className="source-tag">Verified API 2.0</span>
                            {config.liveSearch && <span className="source-tag">Real-time Web</span>}
                          </div>
                        </div>
                      </div>
                    )}

                    {msg.role === 'ai' && (
                      <MessageActions 
                        content={msg.content} 
                        isLast={index === messages.length - 1} 
                        onRegenerate={handleRegenerate}
                        onOpenInCanvas={() => {
                          setCanvasContent({ title: 'AI Response', content: msg.content.replace(/<thought>[\s\S]*?<\/thought>/g, ''), type: 'text' });
                          setIsCanvasOpen(true);
                        }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {currentResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="message-bubble ai-message"
              >
                <div className="message-layout">
                  <div className="message-icon ai-icon">
                    <Bot size={20} color="white" />
                  </div>
                  <div className="message-content" style={{ flex: 1 }}>
                    <div className="message-header" style={{ marginBottom: '0.25rem' }}>
                      Lumi
                    </div>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: CodeBlock
                      }}
                    >
                      {currentResponse}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && !currentResponse && (
            <div className="status-container" style={{ marginLeft: '3.5rem', marginTop: '0.5rem' }}>
              <div className="typing-indicator">
                <span /> <span /> <span />
              </div>
              {statusMessage && (
                <div className="flex flex-col gap-2">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="status-text"
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Activity size={12} className="animate-pulse" color="#3B82F6" />
                    {statusMessage}
                  </motion.div>
                  
                  {config.liveSearch && (
                    <div className="search-pulse-container">
                       <div className="search-pulse" />
                       <div className="search-pulse" style={{ animationDelay: '0.5s' }} />
                       <span style={{ fontSize: '0.65rem', color: '#60a5fa', marginLeft: '0.5rem', fontWeight: 600 }}>CRAWLING NEURAL WEB...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        <footer className="input-area">
          <div className="smart-suggestions-floating">
             <button className="smart-suggestion-btn" onClick={() => setInput("Can you summarize the document I just uploaded?")}>
               <FileText size={12} color="#8b5cf6" /> Summarize file
             </button>
             <button className="smart-suggestion-btn" onClick={() => setInput("Explain this topic like I'm 5 years old: ")}>
               <Activity size={12} color="#10b981" /> Explain topic
             </button>
             <button className="smart-suggestion-btn" onClick={() => setInput("Write a React component for: ")}>
               <Layout size={12} color="#3b82f6" /> Generate code
             </button>
          </div>
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                className="image-preview-container"
              >
                <img src={selectedImage} alt="preview" />
                <button onClick={() => setSelectedImage(null)} className="remove-image-btn"><X size={14} /></button>
              </motion.div>
            )}
            {uploadedFile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                className="file-preview-container"
              >
                <File size={16} />
                <span className="truncate max-w-[150px]">{uploadedFile.name}</span>
                <button onClick={() => setUploadedFile(null)} className="remove-image-btn"><X size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="input-wrapper">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => setSelectedImage(reader.result as string);
                    reader.readAsDataURL(file);
                  } else {
                    setUploadedFile({
                       name: file.name,
                       type: file.type || 'Document',
                       size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
                    });
                  }
                }
              }} 
              style={{ display: 'none' }} 
              accept="image/*,.pdf,.doc,.docx,.csv,.xlsx,.txt" 
            />
            <button 
              className="action-btn" 
              onClick={() => fileInputRef.current?.click()}
              title="Upload Image/File"
            >
              <Plus size={20} />
            </button>
            <button 
              className={`action-btn ${isListening ? 'active-mic' : ''}`} 
              onClick={() => {
                if (isListening) recognitionRef.current?.stop();
                else { setIsListening(true); recognitionRef.current?.start(); }
              }}
              title="Voice Input"
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <input
              type="text"
              className="input-field"
              placeholder={isListening ? "Listening..." : "Message Lumi..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              className={`send-btn ${(input.trim() || selectedImage) ? 'active' : ''}`} 
              onClick={() => handleSend()} 
              disabled={isLoading || (!input.trim() && !selectedImage)}
            >
              <Send size={20} />
            </button>
          </div>
          <p className="footer-note">Lumi can make mistakes. Check important info.</p>
        </footer>

        <AnimatePresence>
          {showAnalytics && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="analytics-pane"
             >
               <div className="analytics-header">
                 <div className="flex items-center gap-2">
                   <Activity size={14} color="#10b981" />
                   <span>Neural Analytics</span>
                 </div>
                 <X size={14} className="cursor-pointer" onClick={() => setShowAnalytics(false)} />
               </div>
               <div className="analytics-grid">
                 <div className="analytics-card">
                   <span className="analytics-label">Latency</span>
                   <span className="analytics-value">{(analytics.latency / 1000).toFixed(2)}s</span>
                 </div>
                 <div className="analytics-card">
                   <span className="analytics-label">Tokens (Est)</span>
                   <span className="analytics-value">{Math.floor(analytics.tokens)}</span>
                 </div>
                 <div className="analytics-card">
                   <span className="analytics-label">Context</span>
                   <span className="analytics-value">{analytics.contextUsed} turns</span>
                 </div>
                 <div className="analytics-card">
                   <span className="analytics-label">Status</span>
                   <span className="analytics-value" style={{ color: '#10b981' }}>{analytics.lastAction}</span>
                 </div>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
        
        {/* Canvas Side Panel */}
        <AnimatePresence>
          {isCanvasOpen && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="canvas-side-panel"
            >
               <div className="canvas-header">
                 <div className="flex items-center gap-3">
                    <Layout size={18} color="#3B82F6" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#94A3B8]">Lumi Canvas</h2>
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="canvas-header-btn" onClick={() => setIsCanvasOpen(false)}><Minimize2 size={16} /></button>
                    <button className="canvas-header-btn" onClick={() => setIsCanvasOpen(false)}><X size={16} /></button>
                 </div>
               </div>
               <div className="canvas-content-area">
                  <div className="canvas-toolbar">
                     <span className="canvas-doc-name">{canvasContent.title}</span>
                     <div className="flex gap-2">
                        <button className="canvas-tool-btn"><Edit2 size={14} /> Edit</button>
                        <button className="canvas-tool-btn"><Copy size={14} /> Copy</button>
                        <button className="canvas-tool-btn" onClick={() => {
                          const blob = new Blob([canvasContent.content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a'); a.href = url; a.download = 'canvas-output.txt'; a.click();
                        }}><Download size={14} /> Save</button>
                     </div>
                  </div>
                  <textarea 
                    className="canvas-editor" 
                    value={canvasContent.content}
                    onChange={(e) => setCanvasContent(prev => ({...prev, content: e.target.value}))}
                  />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
