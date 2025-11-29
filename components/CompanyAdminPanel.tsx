
import React, { useState } from 'react';
import { User, UserRole, Company } from '../types';
import { Trash2, UserPlus, Shield, Smartphone, Camera } from 'lucide-react';

interface Props {
  company: Company;
  users: User[];
  onAddUser: (name: string, email: string, phone: string, avatarUrl?: string) => void;
  onRemoveUser: (userId: string) => void;
}

export const CompanyAdminPanel: React.FC<Props> = ({ company, users, onAddUser, onRemoveUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', avatarUrl: '' });
  const [error, setError] = useState('');

  const companyUsers = users.filter(u => u.companyId === company.id);
  const usagePercentage = (companyUsers.length / company.maxUsers) * 100;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUser(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (companyUsers.length >= company.maxUsers) {
      setError('Limite máximo de 15 usuários atingido.');
      return;
    }
    if (newUser.name && newUser.email && newUser.phone) {
      onAddUser(newUser.name, newUser.email, newUser.phone, newUser.avatarUrl);
      setNewUser({ name: '', email: '', phone: '', avatarUrl: '' });
      setIsModalOpen(false);
      setError('');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão da Equipe</h1>
          <p className="text-gray-500 mt-1">{company.name}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={companyUsers.length >= company.maxUsers}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all ${
            companyUsers.length >= company.maxUsers 
              ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
              : 'bg-whatsapp hover:bg-whatsapp-dark text-white'
          }`}
        >
          <UserPlus size={20} />
          Adicionar Colaborador
        </button>
      </div>

      {/* Usage Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-gray-600">Ocupação da Equipe</span>
          <span className="text-sm font-bold text-gray-900">{companyUsers.length} / {company.maxUsers} usuários</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${usagePercentage >= 100 ? 'bg-red-500' : 'bg-whatsapp'}`} 
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
        {companyUsers.length >= company.maxUsers && (
            <p className="text-red-500 text-xs mt-2 font-medium">Limite do plano atingido.</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-sm bg-gray-50">
              <th className="px-6 py-4 font-medium">Nome</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Função</th>
              <th className="px-6 py-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {companyUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-full h-full object-cover"/>
                    </div>
                    <span className="font-medium text-gray-900">{user.name}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.role === UserRole.COMPANY_ADMIN ? (
                      <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-md text-xs font-bold">
                        <Shield size={12} /> Admin
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs">
                        <Smartphone size={12} /> Colaborador
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.role !== UserRole.COMPANY_ADMIN && (
                    <button 
                      onClick={() => onRemoveUser(user.id)}
                      className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Novo Colaborador</h3>
            
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">{error}</div>}

            <div className="flex justify-center mb-4">
                <div className="relative w-20 h-20 rounded-full bg-gray-100 border border-gray-300 overflow-hidden cursor-pointer hover:border-whatsapp group">
                    {newUser.avatarUrl ? (
                        <img src={newUser.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-400">
                            <Camera size={24} />
                        </div>
                    )}
                    <input 
                        type="file" 
                        accept="image/png, image/jpeg" 
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-whatsapp-dark focus:border-whatsapp-dark outline-none"
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-whatsapp-dark focus:border-whatsapp-dark outline-none"
                  placeholder="joao@empresa.com"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Celular (WhatsApp)</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-whatsapp-dark focus:border-whatsapp-dark outline-none"
                  placeholder="+55 11 99999-9999"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAdd}
                className="px-4 py-2 bg-whatsapp text-white rounded-lg hover:bg-whatsapp-dark"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
