
import React, { useState } from 'react';
import { Company, User } from '../types';
import { Trash2, Plus, Building2, Users, Search, Key, Calendar, Briefcase, Phone } from 'lucide-react';

interface Props {
  companies: Company[];
  onAddCompany: (name: string) => void;
  onDeleteCompany: (id: string) => void;
  users: User[];
  onChangeUserPassword: (userId: string, newPass: string) => void;
}

export const SuperAdminPanel: React.FC<Props> = ({ companies, onAddCompany, onDeleteCompany, users, onChangeUserPassword }) => {
  const [activeTab, setActiveTab] = useState<'companies' | 'users'>('companies');
  
  // Company State
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  // User State
  const [userSearch, setUserSearch] = useState('');
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handleAddCompany = () => {
    if (newCompanyName.trim()) {
      onAddCompany(newCompanyName);
      setNewCompanyName('');
      setIsCompanyModalOpen(false);
    }
  };

  const handleChangePassword = () => {
    if (passwordModalUser && newPassword) {
        onChangeUserPassword(passwordModalUser.id, newPassword);
        setPasswordModalUser(null);
        setNewPassword('');
        alert(`Senha alterada com sucesso para ${passwordModalUser.name}`);
    }
  };

  const getCompanyUserCount = (companyId: string) => users.filter(u => u.companyId === companyId).length;
  
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel Super Admin</h1>
          <p className="text-gray-500 mt-1">Gestão centralizada do SaaS</p>
        </div>
        
        {activeTab === 'companies' && (
            <button 
            onClick={() => setIsCompanyModalOpen(true)}
            className="bg-slate-850 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
            >
            <Plus size={20} />
            Nova Empresa
            </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
            onClick={() => setActiveTab('companies')}
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'companies' ? 'border-slate-850 text-slate-850' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            <Building2 size={18} /> Empresas
        </button>
        <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'users' ? 'border-slate-850 text-slate-850' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            <Users size={18} /> Usuários Totais
        </button>
      </div>

      {activeTab === 'companies' ? (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Building2 size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Total Empresas</p>
                    <p className="text-2xl font-bold">{companies.length}</p>
                </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <Users size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Usuários Ativos</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-700">Empresas Cadastradas</h2>
                </div>
                <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-100 text-gray-500 text-sm">
                    <th className="px-6 py-4 font-medium">Nome da Empresa</th>
                    <th className="px-6 py-4 font-medium">Data Criação</th>
                    <th className="px-6 py-4 font-medium">Usuários</th>
                    <th className="px-6 py-4 font-medium">Plano</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {companies.map(company => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{company.name}</td>
                        <td className="px-6 py-4 text-gray-600">{new Date(company.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                            {getCompanyUserCount(company.id)} / {company.maxUsers}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">Standard (15 Users)</td>
                        <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => onDeleteCompany(company.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Excluir Empresa"
                        >
                            <Trash2 size={18} />
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-700">Todos os Usuários</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar usuário..." 
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-slate-850 outline-none"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-500 text-sm">
                        <th className="px-6 py-4 font-medium">Usuário</th>
                        <th className="px-6 py-4 font-medium">Contato</th>
                        <th className="px-6 py-4 font-medium">Detalhes Pessoais</th>
                        <th className="px-6 py-4 font-medium">Empresa/Função</th>
                        <th className="px-6 py-4 font-medium text-right">Segurança</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(user => {
                            const userCompany = companies.find(c => c.id === user.companyId);
                            return (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-full h-full object-cover"/>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone size={14} className="text-gray-400" />
                                            {user.phone || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar size={14} className="text-gray-400" />
                                                {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'N/A'}
                                                {user.age && <span className="text-xs bg-gray-100 px-1.5 rounded">({user.age} anos)</span>}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Briefcase size={14} className="text-gray-400" />
                                                {user.profession || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-800">{userCompany?.name || 'Sistema'}</p>
                                            <span className="text-xs text-gray-500 uppercase font-bold">
                                                {user.role === 'AGENT' ? 'COLABORADOR' : user.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setPasswordModalUser(user)}
                                            className="text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2 ml-auto text-sm font-medium"
                                        >
                                            <Key size={16} /> Senha
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Add Company Modal */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Adicionar Nova Empresa</h3>
            <input
              type="text"
              placeholder="Nome da Empresa"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsCompanyModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddCompany}
                className="px-4 py-2 bg-slate-850 text-white rounded-lg hover:bg-slate-700"
              >
                Criar Empresa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-xl font-bold">Alterar Senha</h3>
                    <p className="text-sm text-gray-500">Usuário: {passwordModalUser.name}</p>
                 </div>
                 <button onClick={() => setPasswordModalUser(null)} className="text-gray-400 hover:text-gray-600">
                    <Trash2 size={20} className="rotate-45" /> {/* Using Trash as X icon close enough */}
                 </button>
            </div>
            
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nova Senha</label>
            <input
              type="text"
              placeholder="Digite a nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
            />
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setPasswordModalUser(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={handleChangePassword}
                className="px-4 py-2 bg-slate-850 text-white rounded-lg hover:bg-slate-700"
              >
                Salvar Nova Senha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
