
import { User, UserRole, Company, Chat, ScheduledMessage } from '../types';

// Mock Data
export const INITIAL_COMPANIES: Company[] = [
  { 
    id: 'c1', 
    name: 'Tech Solutions Ltda', 
    maxUsers: 15, 
    createdAt: new Date().toISOString(),
    metaConfig: {
      phoneNumberId: '',
      wabaId: '',
      accessToken: '',
      webhookVerifyToken: '' 
    }
  },
  { 
    id: 'c2', 
    name: 'Padaria do João', 
    maxUsers: 5, 
    createdAt: new Date().toISOString() 
  }
];

export const INITIAL_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Super Admin', 
    email: 'admin@zapflow.com', 
    password: '123', 
    role: UserRole.SUPER_ADMIN, 
    phone: '5511999990001',
    birthDate: '1985-05-10',
    age: 38,
    profession: 'Administrator'
  },
  { 
    id: 'u2', 
    name: 'Carlos Gerente', 
    email: 'carlos@tech.com', 
    password: '123', 
    role: UserRole.COMPANY_ADMIN, 
    companyId: 'c1', 
    avatarUrl: 'https://picsum.photos/seed/u2/200', 
    phone: '5511999990002',
    birthDate: '1990-08-15',
    age: 33,
    profession: 'Gerente Comercial'
  },
  { 
    id: 'u3', 
    name: 'Ana Atendente', 
    email: 'ana@tech.com', 
    password: '123', 
    role: UserRole.AGENT, 
    companyId: 'c1', 
    avatarUrl: 'https://picsum.photos/seed/u3/200', 
    phone: '5511999990003',
    birthDate: '1995-12-01',
    age: 28,
    profession: 'Suporte Técnico'
  },
  { 
    id: 'u4', 
    name: 'Pedro Atendente', 
    email: 'pedro@tech.com', 
    password: '123', 
    role: UserRole.AGENT, 
    companyId: 'c1', 
    avatarUrl: 'https://picsum.photos/seed/u4/200', 
    phone: '5511999990004',
    birthDate: '1998-03-20',
    age: 25,
    profession: 'Vendas'
  },
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat1',
    customerName: 'Maria Silva',
    customerPhone: '+55 11 99999-9999',
    avatarUrl: 'https://picsum.photos/seed/maria/200',
    unreadCount: 2,
    lastMessageTimestamp: Date.now() - 1000 * 60 * 60,
    status: 'active',
    customerEmail: 'maria.silva@gmail.com',
    customerCompany: 'Maria Doces',
    customerValue: 150.00,
    customerInstagram: '@mariadoces',
    customerWebsite: 'www.mariadoces.com.br',
    messages: [
      { id: 'm1', text: 'Olá, gostaria de saber o preço do plano.', senderId: 'customer', timestamp: Date.now() - 1000 * 60 * 60, status: 'read', isCustomer: true },
      { id: 'm2', text: 'Alguém pode me ajudar?', senderId: 'customer', timestamp: Date.now() - 1000 * 60 * 5, status: 'read', isCustomer: true },
    ]
  },
  {
    id: 'chat2',
    customerName: 'João Souza',
    customerPhone: '+55 21 88888-8888',
    avatarUrl: 'https://picsum.photos/seed/joao/200',
    unreadCount: 0,
    lastMessageTimestamp: Date.now() - 1000 * 60 * 120,
    status: 'active',
    customerEmail: 'joao.souza@outlook.com',
    customerCompany: 'J&S Transportes',
    customerValue: 5000.00,
    messages: [
      { id: 'm3', text: 'Meu pedido atrasou.', senderId: 'customer', timestamp: Date.now() - 1000 * 60 * 120, status: 'read', isCustomer: true },
      { id: 'm4', text: 'Vamos verificar para você, João.', senderId: 'u3', timestamp: Date.now() - 1000 * 60 * 100, status: 'read', isCustomer: false },
    ]
  },
  {
    id: 'chat3',
    customerName: 'Fernanda Lima',
    customerPhone: '+55 31 77777-7777',
    avatarUrl: 'https://picsum.photos/seed/fernanda/200',
    unreadCount: 0,
    lastMessageTimestamp: Date.now() - 1000 * 60 * 60 * 24,
    status: 'resolved',
    customerEmail: 'fer.lima@gmail.com',
    customerValue: 0.00,
    messages: [
      { id: 'm5', text: 'Obrigada pelo atendimento!', senderId: 'customer', timestamp: Date.now() - 1000 * 60 * 60 * 24, status: 'read', isCustomer: true },
      { id: 'm6', text: 'Imagina, conte conosco!', senderId: 'u3', timestamp: Date.now() - 1000 * 60 * 60 * 24, status: 'read', isCustomer: false },
    ]
  }
];

export const INITIAL_SCHEDULED_MESSAGES: ScheduledMessage[] = [
  {
    id: 'sch1',
    customerName: 'Roberto Carlos',
    customerPhone: '+55 11 91234-5678',
    text: 'Olá Roberto, confirmando nossa reunião amanhã às 14h.',
    scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    status: 'pending',
    createdBy: 'u2'
  }
];

// Helper to create ID
export const generateId = () => Math.random().toString(36).substr(2, 9);
