
import React, { useState, useEffect } from 'react';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { CompanyAdminPanel } from './components/CompanyAdminPanel';
import { Inbox } from './components/Inbox';
import { IntegrationPanel } from './components/IntegrationPanel';
import { DashboardPanel } from './components/DashboardPanel';
import { CalendarPanel } from './components/CalendarPanel';
import { User, UserRole, Company, Chat, Message, ScheduledMessage } from './types';
import { INITIAL_USERS, INITIAL_COMPANIES, INITIAL_CHATS, INITIAL_SCHEDULED_MESSAGES, generateId } from './services/mockStore';
import { LogOut, MessageSquare, Users, Building2, Link as LinkIcon, Lock, Mail, ArrowRight, LayoutDashboard, Calendar, UserPlus, Phone, Briefcase, Calendar as CalendarIcon, Hash, Camera } from 'lucide-react';

// Helper to safely parse JSON from localStorage
const safeLoad = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return fallback;
  }
};

const App: React.FC = () => {
  // Global State with LocalStorage initialization
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>(() => safeLoad('zapflow_users', INITIAL_USERS));
  
  const [companies, setCompanies] = useState<Company[]>(() => safeLoad('zapflow_companies', INITIAL_COMPANIES));
  
  const [chats, setChats] = useState<Chat[]>(() => safeLoad('zapflow_chats', INITIAL_CHATS));

  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(() => safeLoad('zapflow_scheduled_messages', INITIAL_SCHEDULED_MESSAGES));

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // View State for Company Admin
  const [adminView, setAdminView] = useState<'team' | 'integration' | 'chat' | 'dashboard' | 'calendar'>('chat');

  // --- PERSISTENCE EFFECT ---
  useEffect(() => {
    try { localStorage.setItem('zapflow_users', JSON.stringify(users)); } catch(e) {}
  }, [users]);

  useEffect(() => {
    try { localStorage.setItem('zapflow_companies', JSON.stringify(companies)); } catch(e) {}
  }, [companies]);

  useEffect(() => {
    try { localStorage.setItem('zapflow_chats', JSON.stringify(chats)); } catch(e) {}
  }, [chats]);

  useEffect(() => {
    try { localStorage.setItem('zapflow_scheduled_messages', JSON.stringify(scheduledMessages)); } catch(e) {}
  }, [scheduledMessages]);


  // --- ACTIONS ---

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentChatId(null);
    setAdminView('chat');
  };

  const handleRegister = (data: Partial<User> & { companyName: string }) => {
    // Create new Company
    const newCompanyId = generateId();
    const newCompany: Company = {
        id: newCompanyId,
        name: data.companyName,
        maxUsers: 15,
        createdAt: new Date().toISOString()
    };
    
    // Create new User (Admin of that company)
    const newUser: User = {
        id: generateId(),
        name: data.name!,
        email: data.email!,
        password: data.password!,
        phone: data.phone,
        birthDate: data.birthDate,
        age: data.age,
        profession: data.profession,
        role: UserRole.COMPANY_ADMIN,
        companyId: newCompanyId,
        avatarUrl: data.avatarUrl || ''
    };

    setCompanies([...companies, newCompany]);
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  // Super Admin Actions
  const addCompany = (name: string) => {
    const newCompany: Company = {
      id: generateId(),
      name,
      maxUsers: 15, 
      createdAt: new Date().toISOString()
    };
    setCompanies([...companies, newCompany]);
  };

  const deleteCompany = (id: string) => {
    setCompanies(companies.filter(c => c.id !== id));
    setUsers(users.filter(u => u.companyId !== id)); 
  };

  const changeUserPassword = (userId: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPass } : u));
  };

  // Company Admin Actions
  const addUser = (name: string, email: string, phone: string, avatarUrl?: string) => {
    if (!currentUser?.companyId) return;
    const newUser: User = {
      id: generateId(),
      name,
      email,
      phone,
      password: '123', // Default password for new users
      role: UserRole.AGENT,
      companyId: currentUser.companyId,
      avatarUrl: avatarUrl || ''
    };
    setUsers([...users, newUser]);
  };

  const removeUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const updateCompanyConfig = (config: NonNullable<Company['metaConfig']>) => {
    if (!currentUser?.companyId) return;
    setCompanies(prev => prev.map(c => 
      c.id === currentUser.companyId 
        ? { ...c, metaConfig: config }
        : c
    ));
  };

  // Chat Actions
  const sendMessage = (chatId: string, text: string, attachmentUrl?: string, attachmentType?: 'image' | 'file' | 'audio') => {
    const newMessage: Message = {
      id: generateId(),
      text,
      senderId: currentUser?.id || 'unknown',
      timestamp: Date.now(),
      status: 'sent',
      isCustomer: false,
      attachmentUrl: attachmentUrl,
      attachmentType: attachmentType || (attachmentUrl ? 'image' : undefined)
    };

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessageTimestamp: newMessage.timestamp,
        };
      }
      return chat;
    }));
  };

  const receiveMessage = (chatId: string, text: string) => {
    const newMessage: Message = {
      id: generateId(),
      text,
      senderId: 'customer',
      timestamp: Date.now(),
      status: 'read', 
      isCustomer: true
    };

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessageTimestamp: newMessage.timestamp,
          unreadCount: chat.id === currentChatId ? 0 : chat.unreadCount + 1
        };
      }
      return chat;
    }));
  };

  const selectChat = (id: string) => {
      setCurrentChatId(id);
      setChats(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
  };

  const updateChat = (chatId: string, data: Partial<Chat>) => {
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, ...data } : c));
  };

  // --- EVOLUTION API SIMULATION LOGIC ---
  const simulateIncomingWebhook = (payload: any) => {
    try {
        // Basic Evolution API parsing logic
        // Structure usually: data: { key: { remoteJid }, pushName, message: { conversation } }
        const data = payload?.data;
        if (!data) throw new Error("Invalid Payload");

        const remoteJid = data.key?.remoteJid || '';
        const rawPhone = remoteJid.split('@')[0];
        const pushName = data.pushName || rawPhone;
        
        // Extract text message (supports simple conversation or extended text)
        const text = data.message?.conversation || data.message?.extendedTextMessage?.text || '[Mídia Recebida]';

        if (!rawPhone) throw new Error("No phone number found");

        // Format phone for display
        const formattedPhone = `+${rawPhone.slice(0,2)} ${rawPhone.slice(2,4)} ${rawPhone.slice(4,9)}-${rawPhone.slice(9)}`;

        // Check if chat exists
        const existingChat = chats.find(c => c.customerPhone.replace(/\D/g, '').includes(rawPhone));

        if (existingChat) {
            receiveMessage(existingChat.id, text);
            alert(`Mensagem recebida no chat de: ${existingChat.customerName}`);
        } else {
            // Create new chat
            const newChatId = generateId();
            const newChat: Chat = {
                id: newChatId,
                customerName: pushName,
                customerPhone: formattedPhone,
                avatarUrl: `https://ui-avatars.com/api/?name=${pushName}&background=random`,
                unreadCount: 1,
                lastMessageTimestamp: Date.now(),
                status: 'active',
                messages: [{
                    id: generateId(),
                    text: text,
                    senderId: 'customer',
                    timestamp: Date.now(),
                    status: 'read',
                    isCustomer: true
                }]
            };
            setChats(prev => [newChat, ...prev]);
            alert(`Novo chat criado para: ${pushName}`);
        }

    } catch (e) {
        console.error(e);
        alert("Erro ao processar webhook. Verifique o formato do JSON.");
    }
  };

  // Schedule Actions
  const addScheduledMessage = (customerName: string, customerPhone: string, text: string, scheduledDate: string) => {
    const newMessage: ScheduledMessage = {
        id: generateId(),
        customerName,
        customerPhone,
        text,
        scheduledDate,
        status: 'pending',
        createdBy: currentUser?.id || 'unknown'
    };
    setScheduledMessages([...scheduledMessages, newMessage]);
  };

  const deleteScheduledMessage = (id: string) => {
      setScheduledMessages(scheduledMessages.filter(m => m.id !== id));
  };

  // --- RENDER ---

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={setCurrentUser} onRegister={handleRegister} />;
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-20 bg-slate-850 flex flex-col items-center py-6 text-white shrink-0">
        <div className="mb-8 p-2 bg-green-500 rounded-lg">
          <MessageSquare size={24} className="text-white" />
        </div>
        
        <div className="flex flex-col gap-6 w-full items-center">
            {currentUser.role === UserRole.SUPER_ADMIN && (
                <NavButton 
                  active={true} 
                  onClick={() => {}} 
                  icon={<Building2 />} 
                  tooltip="Painel Admin" 
                />
            )}
            
            {currentUser.role === UserRole.COMPANY_ADMIN && (
                <>
                  <NavButton 
                    active={adminView === 'chat'} 
                    onClick={() => setAdminView('chat')}
                    icon={<MessageSquare />} 
                    tooltip="Mensagens" 
                  />
                  <NavButton 
                    active={adminView === 'dashboard'} 
                    onClick={() => setAdminView('dashboard')}
                    icon={<LayoutDashboard />} 
                    tooltip="Dashboard" 
                  />
                  <NavButton 
                    active={adminView === 'calendar'} 
                    onClick={() => setAdminView('calendar')}
                    icon={<Calendar />} 
                    tooltip="Agendamentos" 
                  />
                  <NavButton 
                    active={adminView === 'team'} 
                    onClick={() => setAdminView('team')}
                    icon={<Users />} 
                    tooltip="Equipe" 
                  />
                  <NavButton 
                    active={adminView === 'integration'} 
                    onClick={() => setAdminView('integration')}
                    icon={<LinkIcon />} 
                    tooltip="Integração Meta" 
                  />
                </>
            )}

            {currentUser.role === UserRole.AGENT && (
                 <NavButton 
                    active={true} 
                    onClick={() => {}} 
                    icon={<MessageSquare />} 
                    tooltip="Chat" 
                 />
            )}
        </div>

        <div className="mt-auto flex flex-col gap-6 w-full items-center">
             <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold overflow-hidden" title={currentUser.name}>
                {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="Me" className="w-full h-full object-cover" /> : currentUser.name.substring(0,2).toUpperCase()}
             </div>
             <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors">
                <LogOut size={24} />
             </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {currentUser.role === UserRole.SUPER_ADMIN && (
          <SuperAdminPanel 
            companies={companies} 
            users={users}
            onAddCompany={addCompany} 
            onDeleteCompany={deleteCompany}
            onChangeUserPassword={changeUserPassword}
          />
        )}

        {currentUser.role === UserRole.COMPANY_ADMIN && (
             <div className="h-full">
                {adminView === 'team' && (
                  <CompanyAdminPanel 
                      company={companies.find(c => c.id === currentUser.companyId)!}
                      users={users}
                      onAddUser={addUser}
                      onRemoveUser={removeUser}
                  />
                )}
                {adminView === 'integration' && (
                  <IntegrationPanel
                    company={companies.find(c => c.id === currentUser.companyId)!}
                    onUpdateConfig={updateCompanyConfig}
                    onSimulateWebhook={simulateIncomingWebhook}
                  />
                )}
                {adminView === 'dashboard' && (
                  <DashboardPanel 
                    chats={chats}
                    users={users}
                  />
                )}
                {adminView === 'calendar' && (
                  <CalendarPanel 
                    scheduledMessages={scheduledMessages}
                    onScheduleMessage={addScheduledMessage}
                    onDeleteScheduled={deleteScheduledMessage}
                  />
                )}
                {adminView === 'chat' && (
                  <Inbox 
                    currentUser={currentUser}
                    chats={chats}
                    currentChatId={currentChatId}
                    onSelectChat={selectChat}
                    onSendMessage={sendMessage}
                    onReceiveMessage={receiveMessage}
                    onUpdateChat={updateChat}
                  />
                )}
             </div>
        )}

        {currentUser.role === UserRole.AGENT && (
          <Inbox 
            currentUser={currentUser}
            chats={chats}
            currentChatId={currentChatId}
            onSelectChat={selectChat}
            onSendMessage={sendMessage}
            onReceiveMessage={receiveMessage}
            onUpdateChat={updateChat}
          />
        )}
      </main>
    </div>
  );
};

// --- Sub Components ---

const NavButton = ({ icon, active, tooltip, onClick }: { icon: React.ReactNode, active: boolean, tooltip: string, onClick: () => void }) => (
    <div 
      onClick={onClick}
      className={`p-3 rounded-xl transition-all cursor-pointer group relative ${active ? 'bg-white/10 text-green-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
        {icon}
        <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {tooltip}
        </span>
    </div>
);

const LoginScreen = ({ 
    users, 
    onLogin, 
    onRegister 
}: { 
    users: User[], 
    onLogin: (user: User) => void,
    onRegister: (data: Partial<User> & { companyName: string }) => void 
}) => {
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Register State
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regBirthDate, setRegBirthDate] = useState('');
    const [regAge, setRegAge] = useState('');
    const [regProfession, setRegProfession] = useState('');
    const [regCompanyName, setRegCompanyName] = useState('');
    const [regAvatar, setRegAvatar] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setRegAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (isRegistering) {
            // Register Logic
            if (regName && regEmail && regPassword && regCompanyName) {
                onRegister({
                    name: regName,
                    email: regEmail,
                    password: regPassword,
                    phone: regPhone,
                    birthDate: regBirthDate,
                    age: parseInt(regAge) || 0,
                    profession: regProfession,
                    companyName: regCompanyName,
                    avatarUrl: regAvatar
                });
            } else {
                setError('Preencha todos os campos obrigatórios.');
            }
        } else {
            // Login Logic
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                onLogin(user);
            } else {
                setError('Credenciais inválidas. Tente novamente.');
            }
        }
    };

    const fillDemo = (role: UserRole) => {
        const demoUser = users.find(u => u.role === role);
        if (demoUser) {
            setEmail(demoUser.email);
            setPassword(demoUser.password || '');
            setIsRegistering(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className={`bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full transition-all duration-300 ${isRegistering ? 'max-w-2xl' : 'max-w-md'}`}>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                        <MessageSquare className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">ZapFlow</h1>
                    <p className="text-gray-500 mt-1">{isRegistering ? 'Crie sua conta para começar' : 'Acesse sua conta'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}
                    
                    {!isRegistering ? (
                        <>
                            {/* Login Fields */}
                            <div className="space-y-4">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Seu email" 
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Sua senha" 
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Registration Fields */}
                             <div className="md:col-span-2 flex justify-center mb-2">
                                <div className="relative cursor-pointer group">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200 group-hover:border-green-500 transition-colors">
                                        {regAvatar ? (
                                            <img src={regAvatar} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Camera size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload da foto" />
                                    <p className="text-xs text-center text-gray-500 mt-1">Foto de Perfil</p>
                                </div>
                             </div>

                             <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Dados da Empresa</label>
                                <div className="relative group mt-1">
                                    <Building2 className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        value={regCompanyName}
                                        onChange={e => setRegCompanyName(e.target.value)}
                                        placeholder="Nome da sua Empresa" 
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                        required
                                    />
                                </div>
                             </div>

                             <div className="md:col-span-2 mt-2 border-t border-gray-100 pt-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Dados do Usuário</label>
                             </div>

                             <div className="relative group">
                                <UserPlus className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    value={regName}
                                    onChange={e => setRegName(e.target.value)}
                                    placeholder="Nome Completo" 
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                    required
                                />
                             </div>
                             
                             <div className="relative group">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="email" 
                                    value={regEmail}
                                    onChange={e => setRegEmail(e.target.value)}
                                    placeholder="E-mail" 
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                    required
                                />
                             </div>

                             <div className="relative group">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="password" 
                                    value={regPassword}
                                    onChange={e => setRegPassword(e.target.value)}
                                    placeholder="Senha" 
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                    required
                                />
                             </div>

                             <div className="relative group">
                                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    value={regPhone}
                                    onChange={e => setRegPhone(e.target.value)}
                                    placeholder="WhatsApp" 
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                    required
                                />
                             </div>

                             <div className="relative group">
                                <CalendarIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="date" 
                                    value={regBirthDate}
                                    onChange={e => setRegBirthDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-600"
                                    required
                                />
                             </div>

                             <div className="relative group">
                                <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="number" 
                                    value={regAge}
                                    onChange={e => setRegAge(e.target.value)}
                                    placeholder="Idade" 
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                />
                             </div>

                             <div className="relative group md:col-span-2">
                                <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    value={regProfession}
                                    onChange={e => setRegProfession(e.target.value)}
                                    placeholder="Profissão" 
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                />
                             </div>
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {isRegistering ? (
                            <>Criar Conta <UserPlus size={20} /></>
                        ) : (
                            <>Entrar na Plataforma <ArrowRight size={20} /></>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => {
                            setIsRegistering(!isRegistering); 
                            setError('');
                        }}
                        className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                    >
                        {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
                    </button>
                </div>

                {!isRegistering && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-xs text-center text-gray-400 mb-4">Acesso rápido (Demo):</p>
                        <div className="flex justify-center gap-2 flex-wrap">
                            <button onClick={() => fillDemo(UserRole.SUPER_ADMIN)} className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100">Super Admin</button>
                            <button onClick={() => fillDemo(UserRole.COMPANY_ADMIN)} className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100">Empresa</button>
                            <button onClick={() => fillDemo(UserRole.AGENT)} className="text-xs px-3 py-1 bg-green-50 text-green-600 rounded-full hover:bg-green-100">Colaborador</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
