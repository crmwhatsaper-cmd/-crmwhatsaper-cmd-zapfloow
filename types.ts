
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  AGENT = 'AGENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // WhatsApp
  password?: string; 
  role: UserRole;
  companyId?: string;
  avatarUrl?: string;
  
  // New Registration Fields
  birthDate?: string;
  age?: number;
  profession?: string;
}

export interface Company {
  id: string;
  name: string;
  maxUsers: number;
  createdAt: string;
  metaConfig?: {
    phoneNumberId: string;
    wabaId: string;
    accessToken: string;
    webhookVerifyToken: string;
  };
}

export interface Message {
  id: string;
  text: string;
  senderId: string; // 'customer' or userId
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  isCustomer: boolean;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file' | 'audio';
}

export interface Chat {
  id: string;
  customerName: string;
  customerPhone: string;
  avatarUrl: string;
  messages: Message[];
  unreadCount: number;
  lastMessageTimestamp: number;
  assignedTo?: string; // userId
  status: 'active' | 'resolved'; 
  
  // CRM Fields
  customerEmail?: string;
  customerCompany?: string;
  customerWebsite?: string;
  customerInstagram?: string;
  customerValue?: number; // Valor cobrado
}

export interface ScheduledMessage {
  id: string;
  customerName: string;
  customerPhone: string;
  text: string;
  scheduledDate: string; // ISO String
  status: 'pending' | 'sent';
  createdBy: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  companies: Company[];
  chats: Chat[];
  currentChatId: string | null;
}