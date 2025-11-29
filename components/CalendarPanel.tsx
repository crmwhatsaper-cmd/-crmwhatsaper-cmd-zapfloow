
import React, { useState } from 'react';
import { ScheduledMessage } from '../types';
import { Calendar as CalendarIcon, Clock, Plus, Send, Trash2, Smartphone } from 'lucide-react';

interface Props {
  scheduledMessages: ScheduledMessage[];
  onScheduleMessage: (to: string, phone: string, text: string, date: string) => void;
  onDeleteScheduled: (id: string) => void;
}

export const CalendarPanel: React.FC<Props> = ({ scheduledMessages, onScheduleMessage, onDeleteScheduled }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    text: '',
    date: '',
    time: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.phone && form.text && form.date && form.time) {
        const dateTime = new Date(`${form.date}T${form.time}`).toISOString();
        onScheduleMessage(form.name, form.phone, form.text, dateTime);
        setForm({ name: '', phone: '', text: '', date: '', time: '' });
    }
  };

  // Sort messages by date
  const sortedMessages = [...scheduledMessages].sort((a, b) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-8">
      
      {/* Schedule Form */}
      <div className="w-full md:w-1/3">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="text-whatsapp" />
                Agendar Mensagem
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Contato</label>
                    <input 
                        required
                        type="text"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-whatsapp focus:border-whatsapp outline-none"
                        placeholder="Ex: Cliente VIP"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
                    <input 
                        required
                        type="text"
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-whatsapp focus:border-whatsapp outline-none"
                        placeholder="+55 11 99999-9999"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                        <input 
                            required
                            type="date"
                            value={form.date}
                            onChange={e => setForm({...form, date: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-whatsapp focus:border-whatsapp outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora</label>
                        <input 
                            required
                            type="time"
                            value={form.time}
                            onChange={e => setForm({...form, time: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-whatsapp focus:border-whatsapp outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mensagem</label>
                    <textarea 
                        required
                        rows={4}
                        value={form.text}
                        onChange={e => setForm({...form, text: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-whatsapp focus:border-whatsapp outline-none resize-none"
                        placeholder="Digite o conteúdo da mensagem..."
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full bg-slate-850 hover:bg-slate-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Confirmar Agendamento
                </button>
            </form>
        </div>
      </div>

      {/* Calendar List */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
             <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CalendarIcon size={20} className="text-gray-500" />
                Cronograma de Envios
            </h2>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                {scheduledMessages.length} agendados
            </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
            {sortedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <CalendarIcon size={48} className="mb-4 opacity-20" />
                    <p>Nenhuma mensagem agendada.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedMessages.map(msg => {
                        const date = new Date(msg.scheduledDate);
                        const isPast = date.getTime() < Date.now();
                        
                        return (
                            <div key={msg.id} className="flex gap-4 relative group">
                                <div className="flex flex-col items-center min-w-[60px]">
                                    <span className="text-xs font-bold text-gray-400 uppercase">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                                    <span className={`text-xl font-bold ${isPast ? 'text-gray-400' : 'text-slate-850'}`}>{date.getDate()}</span>
                                    <span className="text-xs text-gray-500">{date.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                                </div>
                                
                                <div className="flex-1 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 rounded-lg p-4 transition-all relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800">{msg.customerName}</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Smartphone size={10} /> {msg.customerPhone}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                            <Clock size={12} />
                                            {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 italic">"{msg.text}"</p>
                                    
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onDeleteScheduled(msg.id)}
                                            className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                                            title="Cancelar agendamento"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
