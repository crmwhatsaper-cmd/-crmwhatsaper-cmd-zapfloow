
import { User, UserRole, Company, Chat, ScheduledMessage } from '../types';

// Mock Data
export const INITIAL_COMPANIES: Company[] = [
  { 
    id: 'c1', 
    name: 'Minha Empresa Demo', 
    maxUsers: 15, 
    createdAt: new Date().toISOString(),
    metaConfig: {
      phoneNumberId: '',
      wabaId: '',
      accessToken: '',
      webhookVerifyToken: '' 
    }
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
    email: 'carlos@empresa.com', 
    password: '123', 
    role: UserRole.COMPANY_ADMIN, 
    companyId: 'c1', 
    avatarUrl: 'https://ui-avatars.com/api/?name=Carlos+Gerente&background=random', 
    phone: '5511999990002',
    birthDate: '1990-08-15',
    age: 33,
    profession: 'Gerente Comercial'
  }
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat1',
    customerName: 'Cliente Exemplo',
    customerPhone: '+55 11 99999-9999',
    avatarUrl: 'https://ui-avatars.com/api/?name=Cliente+Exemplo&background=random',
    unreadCount: 1,
    lastMessageTimestamp: Date.now() - 1000 * 60 * 5,
    status: 'active',
    customerEmail: 'cliente@exemplo.com',
    customerCompany: 'Exemplo Ltda',
    customerValue: 0.00,
    messages: [
      { id: 'm1', text: 'Olá, gostaria de conhecer mais sobre os serviços.', senderId: 'customer', timestamp: Date.now() - 1000 * 60 * 5, status: 'read', isCustomer: true }
    ]
  }
];

export const INITIAL_SCHEDULED_MESSAGES: ScheduledMessage[] = [];

// Helper to create ID
export const generateId = () => Math.random().toString(36).substr(2, 9);
