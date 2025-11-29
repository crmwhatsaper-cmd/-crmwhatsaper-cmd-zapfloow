
import React, { useState, useEffect, useRef } from 'react';
import { Chat, Message, User } from '../types';
import { Send, MoreVertical, Search, Paperclip, Mic, CheckCheck, Smile, Shield, X, Save, Globe, Instagram, Mail, DollarSign, Building, CheckCircle2, RotateCcw, Archive, Image as ImageIcon, Trash2, Smartphone, Users } from 'lucide-react';
import { generateCustomerReply } from '../services/geminiService';

interface Props {
  currentUser: User;
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onSendMessage: (chatId: string, text: string, attachmentUrl?: string, attachmentType?: 'image' | 'file' | 'audio') => void;
  onReceiveMessage: (chatId: string, text: string) => void;
  onUpdateChat?: (chatId: string, data: Partial<Chat>) => void;
}

export const Inbox: React.FC<Props> = ({ 
  currentUser, 
  chats, 
  currentChatId, 
  onSelectChat, 
  onSendMessage,
  onReceiveMessage,
  onUpdateChat
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [viewFilter, setViewFilter] = useState<'active' | 'resolved' | 'contacts'>('active');
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Attachment Staging
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const activeChat = chats.find(c => c.id === currentChatId);
  
  // Filter chats based on viewFilter
  const filteredChats = chats.filter(c => {
      if (viewFilter === 'contacts') {
          // Exibe apenas chats que tenham dados de CRM relevantes preenchidos
          return c.customerEmail || c.customerCompany || (c.customerValue !== undefined && c.customerValue > 0);
      }
      return c.status === viewFilter;
  });
  
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (viewFilter === 'contacts') {
        // Ordena por Valor do Cliente (Maior para Menor) para priorizar clientes importantes no CRM
        const valA = a.customerValue || 0;
        const valB = b.customerValue || 0;
        if (valA !== valB) return valB - valA;
        // Se valores iguais, ordena por nome
        return a.customerName.localeCompare(b.customerName);
    }
    // Para abas de chat, ordena por mensagem mais recente
    return b.lastMessageTimestamp - a.lastMessageTimestamp;
  });

  // CRM Edit State
  const [editForm, setEditForm] = useState<Partial<Chat>>({});

  useEffect(() => {
    if (activeChat) {
      setEditForm({
        customerName: activeChat.customerName,
        customerEmail: activeChat.customerEmail || '',
        customerCompany: activeChat.customerCompany || '',
        customerValue: activeChat.customerValue || 0,
        customerInstagram: activeChat.customerInstagram || '',
        customerWebsite: activeChat.customerWebsite || '',
        customerPhone: activeChat.customerPhone || ''
      });
      // Scroll to bottom on chat change or new message
      scrollToBottom();
    } else {
        setShowContactInfo(false);
    }
    // Clear attachment when switching chats
    setAttachmentPreview(null);
    setInputText('');
    
    // Cleanup recording if chat switches
    if (isRecording) handleCancelRecording();
  }, [activeChat, currentChatId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = window.setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);

    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const triggerGeminiReply = async (history: any[], customerName: string) => {
    setIsTyping(true);
    const reply = await generateCustomerReply(history, customerName);
    setTimeout(() => {
        setIsTyping(false);
        onReceiveMessage(currentChatId!, reply);
    }, 2000 + Math.random() * 2000);
  };

  const handleSendAudio = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                
                // Send user message
                onSendMessage(currentChatId!, '', base64Audio, 'audio');
                
                // Simulate Gemini Response
                const history = activeChat!.messages.map(m => ({
                    role: m.isCustomer ? 'user' : 'model',
                    text: m.text || (m.attachmentType === 'audio' ? '[Áudio]' : m.attachmentType === 'image' ? '[Imagem]' : '')
                }));
                history.push({ role: 'model', text: '[Áudio enviado pelo atendente]' }); 
                
                triggerGeminiReply(history, activeChat!.customerName);
            };
        };

        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        setRecordingTime(0);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !attachmentPreview) || !currentChatId || !activeChat) return;
    
    // Check if chat is resolved
    if (activeChat.status === 'resolved') {
        alert("Reabra a conversa para enviar mensagens.");
        return;
    }

    const text = inputText;
    const attachment = attachmentPreview || undefined;

    // Reset Input State
    setInputText('');
    setAttachmentPreview(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    onSendMessage(currentChatId, text, attachment);

    const history = activeChat.messages.map(m => ({
        role: m.isCustomer ? 'user' : 'model',
        text: m.text || (m.attachmentType === 'audio' ? '[Áudio]' : m.attachmentType === 'image' ? '[Imagem]' : '')
    }));
    if (text) history.push({ role: 'model', text: text });
    else if (attachment) history.push({ role: 'model', text: '[Imagem enviada]' });

    triggerGeminiReply(history, activeChat.customerName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveContact = () => {
    if (onUpdateChat && activeChat) {
        onUpdateChat(activeChat.id, editForm);
        alert("Informações salvas com sucesso!"); 
    }
  };

  const toggleChatStatus = () => {
    if (!activeChat || !onUpdateChat) return;
    const newStatus = activeChat.status === 'active' ? 'resolved' : 'active';
    onUpdateChat(activeChat.id, { status: newStatus });
    if (newStatus === 'resolved' && viewFilter === 'active') {
        onSelectChat(''); 
    }
  };

  const handleHeaderClick = () => {
    setShowContactInfo(!showContactInfo);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setAttachmentPreview(base64String);
            // Reset file input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(file);
    }
  };

  // Helper to group messages by date
  const renderMessagesWithDates = () => {
    if (!activeChat) return null;
    
    const messages = activeChat.messages;
    const elements = [];
    
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const prevMsg = messages[i - 1];
        
        const msgDate = new Date(msg.timestamp);
        const prevMsgDate = prevMsg ? new Date(prevMsg.timestamp) : null;
        
        // Check if date changed
        if (!prevMsgDate || msgDate.toDateString() !== prevMsgDate.toDateString()) {
            elements.push(
                <div key={`date-${msg.id}`} className="flex justify-center my-4">
                    <span className="bg-gray-200 text-gray-600 text-[11px] px-3 py-1 rounded-full shadow-sm font-medium uppercase tracking-wide">
                        {msgDate.toLocaleDateString([], { day: 'numeric', month: 'long' })}
                    </span>
                </div>
            );
        }

        elements.push(
            <div 
                key={msg.id} 
                className={`flex ${msg.isCustomer ? 'justify-start' : 'justify-end'} mb-2`}
            >
                <div 
                    className={`relative max-w-[85%] md:max-w-[65%] rounded-xl px-3 py-2 text-sm shadow-sm ${
                        msg.isCustomer 
                        ? 'bg-white rounded-tl-none' 
                        : 'bg-whatsapp-light rounded-tr-none'
                    }`}
                >
                    {msg.attachmentUrl && msg.attachmentType === 'image' && (
                        <div className="mb-2 rounded-lg overflow-hidden cursor-pointer">
                            <img src={msg.attachmentUrl} alt="anexo" className="max-w-full h-auto max-h-64 object-contain" />
                        </div>
                    )}
                    {msg.attachmentUrl && msg.attachmentType === 'audio' && (
                        <div className="mb-1 min-w-[200px] flex items-center justify-center p-2">
                             <audio controls src={msg.attachmentUrl} className="w-full h-8" />
                        </div>
                    )}
                    {msg.text && <p className="text-gray-800 leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>}
                    
                    <div className="flex justify-end items-center gap-1 mt-1 select-none">
                        <span className="text-[10px] text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {!msg.isCustomer && (
                            <CheckCheck size={14} className={msg.status === 'read' ? 'text-blue-500' : 'text-gray-400'} />
                        )}
                    </div>
                </div>
            </div>
        );
    }
    return elements;
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-[350px] lg:w-[400px] border-r border-gray-200 flex flex-col h-full shrink-0 z-20">
        {/* Header */}
        <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border border-gray-300">
                <img src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.name}`} alt="Me" className="w-full h-full object-cover" />
             </div>
             <span className="font-semibold text-gray-700">{currentUser.name}</span>
          </div>
          <div className="flex gap-4 text-gray-500">
            <MoreVertical size={20} className="cursor-pointer" />
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
            <button 
                onClick={() => setViewFilter('active')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${viewFilter === 'active' ? 'text-whatsapp border-b-2 border-whatsapp' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Abertas
            </button>
            <button 
                onClick={() => setViewFilter('resolved')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${viewFilter === 'resolved' ? 'text-whatsapp border-b-2 border-whatsapp' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Resolvidas
            </button>
            <button 
                onClick={() => setViewFilter('contacts')}
                className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${viewFilter === 'contacts' ? 'text-whatsapp border-b-2 border-whatsapp' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <Users size={16} /> Contatos CRM
            </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-white border-b border-gray-100 shrink-0">
          <div className="relative">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
             <input 
                type="text" 
                placeholder="Pesquisar conversa" 
                className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-whatsapp transition-shadow"
             />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {sortedChats.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                {viewFilter === 'contacts' ? (
                     <>
                        <Users size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">Nenhum contato com dados de CRM encontrado.</p>
                     </>
                ) : (
                    <>
                        <Archive size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma conversa {viewFilter === 'active' ? 'aberta' : 'resolvida'}.</p>
                    </>
                )}
             </div>
          ) : (
             sortedChats.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${currentChatId === chat.id ? 'bg-gray-100' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={chat.avatarUrl} alt={chat.customerName} className="w-full h-full object-cover" />
                  </div>
                  
                  {viewFilter === 'contacts' ? (
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-medium text-gray-900 truncate">{chat.customerName}</h3>
                             {chat.customerValue ? (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    R$ {chat.customerValue.toFixed(2)}
                                </span>
                             ) : (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">CRM</span>
                             )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                             {chat.customerCompany && (
                                 <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <Building size={10} /> {chat.customerCompany}
                                 </p>
                             )}
                             {chat.customerEmail && (
                                 <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Mail size={10} /> {chat.customerEmail}
                                 </p>
                             )}
                             {/* If no CRM data visible, fallback to last message snippet or phone */}
                             {(!chat.customerCompany && !chat.customerEmail) && (
                                 <p className="text-xs text-gray-400">{chat.customerPhone}</p>
                             )}
                        </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{chat.customerName}</h3>
                        <span className={`text-xs ${chat.unreadCount > 0 ? 'text-whatsapp font-bold' : 'text-gray-400'}`}>
                            {new Date(chat.lastMessageTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500 truncate max-w-[80%] flex items-center gap-1">
                                {!chat.messages[chat.messages.length - 1].isCustomer && (
                                    <CheckCheck size={14} className="text-blue-400 shrink-0" />
                                )}
                                {chat.messages[chat.messages.length - 1].attachmentUrl && chat.messages[chat.messages.length - 1].attachmentType === 'image' && (
                                    <ImageIcon size={14} className="shrink-0" />
                                )}
                                {chat.messages[chat.messages.length - 1].attachmentUrl && chat.messages[chat.messages.length - 1].attachmentType === 'audio' && (
                                    <Mic size={14} className="shrink-0" />
                                )}
                                <span className="truncate">
                                {chat.messages[chat.messages.length - 1].text || 
                                (chat.messages[chat.messages.length - 1].attachmentType === 'audio' ? 'Áudio' : 
                                chat.messages[chat.messages.length - 1].attachmentUrl ? 'Imagem' : '')}
                                </span>
                            </p>
                            {chat.unreadCount > 0 && (
                                <span className="bg-whatsapp text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {chat.unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
        <div className="flex-1 flex flex-col h-full bg-slate-100 relative min-w-0">
          {/* Chat Header */}
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center shrink-0 z-10 shadow-sm transition-colors">
            <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleHeaderClick}>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
                <img src={activeChat.avatarUrl} alt={activeChat.customerName} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 leading-tight">{activeChat.customerName}</h2>
                <p className="text-xs text-gray-500">
                    {activeChat.status === 'resolved' 
                        ? <span className="text-orange-500 font-medium flex items-center gap-1"><CheckCircle2 size={10} /> Resolvida</span>
                        : (isTyping ? <span className="text-whatsapp font-bold">digitando...</span> : 'Clique para ver dados')
                    }
                </p>
              </div>
            </div>
            <div className="flex gap-2 text-gray-500 items-center">
              <button 
                onClick={toggleChatStatus}
                className={`p-2 rounded-full transition-colors flex items-center gap-2 text-sm font-medium px-3 ${
                    activeChat.status === 'active' 
                        ? 'bg-white border border-gray-200 hover:bg-green-50 text-green-700' 
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                }`}
                title={activeChat.status === 'active' ? 'Resolver Conversa' : 'Reabrir Conversa'}
              >
                {activeChat.status === 'active' ? <><CheckCircle2 size={18} /> Resolver</> : <><RotateCcw size={18} /> Reabrir</>}
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-10 chat-bg relative">
             <div className="flex flex-col">
                
                {renderMessagesWithDates()}

                {activeChat.status === 'resolved' && (
                    <div className="flex justify-center my-6">
                        <div className="bg-gray-50 border border-gray-200 text-gray-500 text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                             <CheckCircle2 size={16} />
                             Conversa marcada como resolvida
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
             </div>
          </div>

          {/* Input Area */}
          {activeChat.status === 'active' ? (
              <div className="bg-gray-100 px-4 py-3 shrink-0 z-10">
                {/* Attachment Preview Area */}
                {attachmentPreview && !isRecording && (
                    <div className="mb-3 flex items-end gap-2 animate-in slide-in-from-bottom duration-200">
                        <div className="relative group">
                            <img src={attachmentPreview} alt="Preview" className="h-24 w-auto rounded-lg shadow-md border border-gray-200 bg-white" />
                            <button 
                                onClick={() => setAttachmentPreview(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {isRecording ? (
                    <div className="flex items-center gap-4 w-full bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm animate-pulse-soft">
                        <div className="flex items-center gap-2 text-red-500 flex-1">
                             <Mic size={24} className="animate-pulse" />
                             <span className="font-medium font-mono text-lg">{formatTime(recordingTime)}</span>
                             <span className="text-gray-400 text-sm ml-2">Gravando...</span>
                        </div>
                        <button 
                            onClick={handleCancelRecording} 
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
                            title="Cancelar"
                        >
                            <Trash2 size={24} />
                        </button>
                        <button 
                            onClick={handleSendAudio} 
                            className="bg-whatsapp hover:bg-whatsapp-dark text-white p-3 rounded-full shadow-md transition-colors"
                            title="Enviar Áudio"
                        >
                            <Send size={20} className="ml-0.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-end gap-2">
                        <button className="p-3 text-gray-500 hover:bg-gray-200 rounded-full transition-colors mb-1">
                            <Smile size={24} />
                        </button>
                        <div className="relative mb-1">
                            <button 
                                className={`p-3 rounded-full transition-colors ${attachmentPreview ? 'bg-green-100 text-green-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                onClick={() => fileInputRef.current?.click()}
                                title="Anexar Imagem"
                            >
                                <Paperclip size={24} />
                            </button>
                            <input 
                                type="file" 
                                hidden 
                                ref={fileInputRef} 
                                accept="image/png, image/jpeg" 
                                onChange={handleFileUpload} 
                            />
                        </div>
                        
                        <div className="flex-1 relative bg-white rounded-2xl border border-gray-200 focus-within:border-whatsapp focus-within:ring-1 focus-within:ring-whatsapp transition-all shadow-sm">
                            <textarea
                                ref={textareaRef}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Digite uma mensagem..."
                                rows={1}
                                className="w-full rounded-2xl px-4 py-3 bg-transparent border-none focus:outline-none text-gray-800 resize-none max-h-[120px] scrollbar-hide block"
                                style={{ minHeight: '48px' }}
                            />
                        </div>

                        {(inputText.trim() || attachmentPreview) ? (
                            <button 
                                onClick={handleSend}
                                className="p-3 bg-whatsapp hover:bg-whatsapp-dark text-white rounded-full transition-all shadow-md transform hover:scale-105 mb-1"
                            >
                                <Send size={20} className="ml-0.5" />
                            </button>
                        ) : (
                            <button 
                                onClick={handleStartRecording}
                                className="p-3 text-gray-500 hover:bg-gray-200 rounded-full transition-colors mb-1"
                                title="Gravar Áudio"
                            >
                                <Mic size={24} />
                            </button>
                        )}
                    </div>
                )}
              </div>
          ) : (
              <div className="bg-gray-50 px-4 py-6 shrink-0 flex justify-center items-center border-t border-gray-200">
                  <button 
                    onClick={toggleChatStatus}
                    className="flex items-center gap-2 bg-white border border-gray-300 px-6 py-3 rounded-full shadow-sm text-gray-700 font-medium hover:bg-gray-50 hover:text-whatsapp transition-all"
                  >
                    <RotateCcw size={18} /> Reabrir conversa para responder
                  </button>
              </div>
          )}
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50 border-b-8 border-whatsapp">
          <div className="text-center p-10 max-w-md">
             <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <Smartphone size={40} />
             </div>
             <h1 className="text-3xl font-light text-gray-700 mb-4">ZapFlow Web</h1>
             <p className="text-gray-500 text-sm mb-6 leading-relaxed">
               Envie e receba mensagens sem precisar manter seu celular conectado.<br/>
               Use o ZapFlow em até 15 dispositivos ao mesmo tempo.
             </p>
             <div className="text-xs text-gray-400 flex items-center justify-center gap-2 mt-8">
                <Shield size={12} /> Protegido com criptografia de ponta-a-ponta
             </div>
          </div>
        </div>
      )}

      {/* CRM Right Sidebar - Contact Details */}
      {activeChat && showContactInfo && (
        <div className="w-[350px] bg-white border-l border-gray-200 flex flex-col h-full animate-in slide-in-from-right duration-300 shadow-xl z-30">
            <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center gap-3 shrink-0">
                <button onClick={() => setShowContactInfo(false)} className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-200 transition-colors">
                    <X size={20} />
                </button>
                <h3 className="font-medium text-gray-700">Dados do Contato</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-3 shadow-md border-2 border-white ring-2 ring-gray-100">
                        <img src={activeChat.avatarUrl} alt={activeChat.customerName} className="w-full h-full object-cover" />
                    </div>
                    <input 
                        type="text"
                        value={editForm.customerName || ''}
                        onChange={(e) => setEditForm({...editForm, customerName: e.target.value})}
                        className="text-xl font-semibold text-gray-900 text-center bg-transparent border-b border-transparent focus:border-whatsapp focus:outline-none transition-colors"
                    />
                    <input 
                         type="text"
                         value={editForm.customerPhone || ''}
                         onChange={(e) => setEditForm({...editForm, customerPhone: e.target.value})}
                         className="text-sm text-gray-500 text-center bg-transparent border-b border-transparent focus:border-whatsapp focus:outline-none mt-1 transition-colors"
                    />
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors focus-within:ring-1 focus-within:ring-gray-200">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                            <Mail size={12} /> Email
                        </label>
                        <input 
                            type="email"
                            value={editForm.customerEmail || ''}
                            onChange={(e) => setEditForm({...editForm, customerEmail: e.target.value})}
                            placeholder="email@cliente.com"
                            className="w-full bg-transparent text-sm text-gray-800 focus:outline-none"
                        />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors focus-within:ring-1 focus-within:ring-gray-200">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                            <Building size={12} /> Empresa
                        </label>
                        <input 
                            type="text"
                            value={editForm.customerCompany || ''}
                            onChange={(e) => setEditForm({...editForm, customerCompany: e.target.value})}
                            placeholder="Nome da Empresa"
                            className="w-full bg-transparent text-sm text-gray-800 focus:outline-none"
                        />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors focus-within:ring-1 focus-within:ring-gray-200">
                         <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                            <DollarSign size={12} /> Valor Cobrado
                        </label>
                        <div className="flex items-center gap-2">
                           <span className="text-gray-500 text-sm font-medium">R$</span>
                           <input 
                               type="number"
                               step="0.01"
                               min="0"
                               value={editForm.customerValue || ''}
                               onChange={(e) => setEditForm({...editForm, customerValue: e.target.value ? parseFloat(e.target.value) : 0})}
                               placeholder="0.00"
                               className="w-full bg-transparent text-sm text-gray-800 focus:outline-none font-medium"
                           />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors focus-within:ring-1 focus-within:ring-gray-200">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                            <Instagram size={12} /> Instagram
                        </label>
                        <input 
                            type="text"
                            value={editForm.customerInstagram || ''}
                            onChange={(e) => setEditForm({...editForm, customerInstagram: e.target.value})}
                            placeholder="@usuario"
                            className="w-full bg-transparent text-sm text-gray-800 focus:outline-none"
                        />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors focus-within:ring-1 focus-within:ring-gray-200">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                            <Globe size={12} /> Site
                        </label>
                        <input 
                            type="text"
                            value={editForm.customerWebsite || ''}
                            onChange={(e) => setEditForm({...editForm, customerWebsite: e.target.value})}
                            placeholder="www.site.com.br"
                            className="w-full bg-transparent text-sm text-gray-800 focus:outline-none"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleSaveContact}
                    className="w-full mt-6 bg-slate-850 hover:bg-slate-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                >
                    <Save size={18} /> Salvar Informações
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
