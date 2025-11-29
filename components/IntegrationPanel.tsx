
import React, { useState } from 'react';
import { Company } from '../types';
import { Save, Copy, Check, Lock, Smartphone, Server, ArrowRightLeft, Play } from 'lucide-react';

interface Props {
  company: Company;
  onUpdateConfig: (config: NonNullable<Company['metaConfig']>) => void;
  onSimulateWebhook?: (payload: any) => void;
}

export const IntegrationPanel: React.FC<Props> = ({ company, onUpdateConfig, onSimulateWebhook }) => {
  const [formData, setFormData] = useState({
    phoneNumberId: company.metaConfig?.phoneNumberId || '',
    wabaId: company.metaConfig?.wabaId || '',
    accessToken: company.metaConfig?.accessToken || '',
    webhookVerifyToken: company.metaConfig?.webhookVerifyToken || '',
  });
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Simulation State - Generic Clean Data
  const [simulationJson, setSimulationJson] = useState(`{
  "event": "messages.upsert",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false
    },
    "pushName": "Cliente Visitante",
    "message": {
      "conversation": "Olá, gostaria de mais informações."
    }
  }
}`);

  // URL Nativa do MicroSaaS para receber os dados da Evolution
  const webhookUrl = `https://api.zapflow.com.br/webhook/evolution/${company.id}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = () => {
    onUpdateConfig(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = () => {
      if (onSimulateWebhook) {
          try {
              const payload = JSON.parse(simulationJson);
              onSimulateWebhook(payload);
          } catch (e) {
              alert("JSON inválido.");
          }
      }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto overflow-y-auto h-full pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <div className="bg-[#128C7E] text-white p-2 rounded-lg">
            <ArrowRightLeft size={24} />
          </div>
          Integração Evolution API
        </h1>
        <p className="text-gray-500 mt-2">
          Conecte sua instância da Evolution API ao ZapFlow para enviar e receber mensagens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Credentials Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Lock size={18} className="text-gray-400" />
            Configuração de Acesso
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Insira os dados da sua instância Evolution para que o ZapFlow possa enviar mensagens.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Instância</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  name="phoneNumberId"
                  value={formData.phoneNumberId}
                  onChange={handleChange}
                  placeholder="Ex: MinhaEmpresa01"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">API Key (Global)</label>
              <textarea
                name="accessToken"
                value={formData.accessToken}
                onChange={handleChange}
                placeholder="Sua Global API Key da Evolution..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-mono text-sm"
              />
            </div>
            
             <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs text-gray-600">
                Estas credenciais permitem que o ZapFlow <strong>envie</strong> mensagens através da sua Evolution API.
             </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white transition-all ${
                saved ? 'bg-green-600' : 'bg-slate-850 hover:bg-slate-700'
              }`}
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? 'Salvo!' : 'Salvar Configurações'}
            </button>
          </div>
        </div>

        {/* Webhook Info & Simulation */}
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Server size={100} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 relative z-10">Webhook do ZapFlow</h2>
            <p className="text-sm text-gray-600 mb-6 relative z-10">
              Copie a URL abaixo e configure na sua Evolution API para que o ZapFlow <strong>receba</strong> as mensagens.
            </p>

            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL de Callback (Webhook)</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={webhookUrl}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 font-mono outline-none shadow-sm"
                  />
                  <button
                    onClick={handleCopy}
                    className="bg-white border border-gray-300 hover:bg-white hover:text-green-600 hover:border-green-500 text-gray-600 p-2 rounded-lg transition-all shadow-sm"
                    title="Copiar URL"
                  >
                    {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Verify Token (Opcional)</label>
                <div className="flex gap-2">
                  <input
                    name="webhookVerifyToken"
                    value={formData.webhookVerifyToken}
                    onChange={handleChange}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 font-mono outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
             <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <Play size={16} /> 
                Simulador de Recebimento
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
                Como este é um ambiente Frontend (Sem servidor real), as mensagens da Evolution não chegam automaticamente. Use este simulador para testar o fluxo.
            </p>
            
            <textarea
                value={simulationJson}
                onChange={(e) => setSimulationJson(e.target.value)}
                className="w-full h-32 text-xs font-mono border border-yellow-200 rounded-lg p-3 bg-yellow-50 focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none mb-3"
            />
            
            <button 
                onClick={handleSimulate}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
                <Play size={16} /> Simular Webhook da Evolution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};