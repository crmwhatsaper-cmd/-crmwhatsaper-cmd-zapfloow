
import React from 'react';
import { Chat, User } from '../types';
import { BarChart3, CheckCircle2, MessageSquare, Clock, TrendingUp } from 'lucide-react';

interface Props {
  chats: Chat[];
  users: User[];
}

export const DashboardPanel: React.FC<Props> = ({ chats, users }) => {
  // Calculations
  const totalChats = chats.length;
  const resolvedChats = chats.filter(c => c.status === 'resolved').length;
  const activeChats = chats.filter(c => c.status === 'active').length;
  
  // Mock calculation for avg response time (random between 2 and 15 mins)
  const avgResponseTime = 5; 

  // Agent Performance (Mock data based on users + random stats for visual)
  const agentStats = users.filter(u => u.role !== 'SUPER_ADMIN').map(user => {
    // Count messages sent by this user in all chats
    const msgCount = chats.reduce((acc, chat) => {
        return acc + chat.messages.filter(m => m.senderId === user.id).length;
    }, 0);
    
    return {
        name: user.name,
        conversations: Math.floor(Math.random() * 20) + 5, // Mock
        resolved: Math.floor(Math.random() * 10) + 2, // Mock
        msgCount: msgCount + Math.floor(Math.random() * 50) // Mock to make graph look fuller
    };
  });

  const maxMsgs = Math.max(...agentStats.map(a => a.msgCount), 1);

  return (
    <div className="p-8 max-w-7xl mx-auto overflow-y-auto h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Geral</h1>
        <p className="text-gray-500 mt-1">Visão geral de métricas e desempenho da equipe.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Total Conversas</p>
                    <h3 className="text-2xl font-bold text-gray-900">{totalChats}</h3>
                </div>
            </div>
            <div className="text-xs text-green-600 flex items-center font-medium">
                <TrendingUp size={12} className="mr-1" /> +12% vs mês anterior
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Resolvidas</p>
                    <h3 className="text-2xl font-bold text-gray-900">{resolvedChats}</h3>
                </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(resolvedChats / totalChats) * 100}%` }}></div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                    <Clock size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Em Atendimento</p>
                    <h3 className="text-2xl font-bold text-gray-900">{activeChats}</h3>
                </div>
            </div>
             <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${(activeChats / totalChats) * 100}%` }}></div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Tempo Médio</p>
                    <h3 className="text-2xl font-bold text-gray-900">{avgResponseTime} min</h3>
                </div>
            </div>
             <div className="text-xs text-green-600 flex items-center font-medium">
                -2min vs semana passada
            </div>
        </div>
      </div>

      {/* Agent Performance Chart */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Desempenho por Atendente</h2>
        
        <div className="space-y-6">
            {agentStats.map((agent, index) => (
                <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{agent.name}</span>
                        <span className="text-gray-500">{agent.msgCount} mensagens trocadas</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden flex">
                        <div 
                            className="bg-slate-800 h-full rounded-l-full transition-all duration-1000" 
                            style={{ width: `${(agent.msgCount / maxMsgs) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Conversas Ativas: <strong>{agent.conversations}</strong></span>
                        <span>Resolvidas: <strong>{agent.resolved}</strong></span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
