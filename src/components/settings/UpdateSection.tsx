import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface KotiUpdater {
  getVersion: () => Promise<{ shell: string; web: string }>;
  check: () => Promise<{ ok: boolean; error?: string; current?: string; latest?: string; available?: boolean; notes?: string }>;
  install: () => Promise<{ ok: boolean; error?: string; version?: string; installed?: boolean }>;
  apply: () => Promise<void>;
}

const getUpdater = (): KotiUpdater | undefined => (window as unknown as { kotiUpdater?: KotiUpdater }).kotiUpdater;

type Phase = 'idle' | 'checking' | 'available' | 'installing' | 'ready' | 'uptodate' | 'error';

export const UpdateSection: React.FC = () => {
  const updater = getUpdater();
  const [version, setVersion] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [latest, setLatest] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    updater?.getVersion().then((v) => setVersion(v.web));
  }, [updater]);

  // Only available in the desktop (Electron) app
  if (!updater) return null;

  const handleCheck = async () => {
    setPhase('checking');
    setError('');
    const r = await updater.check();
    if (!r.ok) {
      setError(r.error || 'Erro ao buscar atualizações.');
      setPhase('error');
    } else if (r.available) {
      setLatest(r.latest || '');
      setNotes(r.notes || '');
      setPhase('available');
    } else {
      setPhase('uptodate');
    }
  };

  const handleInstall = async () => {
    setPhase('installing');
    const r = await updater.install();
    if (!r.ok) {
      setError(r.error || 'Falha ao instalar a atualização.');
      setPhase('error');
    } else {
      setPhase('ready');
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
      <div>
        <h4 className="text-sm font-medium text-white flex items-center gap-1.5">
          <RefreshCw size={15} className="text-blue-400" />
          Atualizações do Koti
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">Versão atual: {version || '...'}</p>
      </div>

      {phase === 'uptodate' && <p className="text-xs text-emerald-300">Você já está na versão mais recente.</p>}
      {phase === 'available' && (
        <p className="text-xs text-blue-200">
          Nova versão disponível: <strong>{latest}</strong>
          {notes ? ` — ${notes}` : ''}
        </p>
      )}
      {phase === 'ready' && <p className="text-xs text-emerald-300">Atualização baixada! Reinicie a interface para aplicar.</p>}
      {phase === 'error' && <p className="text-xs text-rose-300">{error}</p>}

      {phase === 'available' ? (
        <button type="button" onClick={handleInstall} className="w-full py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white">
          Baixar e instalar {latest}
        </button>
      ) : phase === 'ready' ? (
        <button type="button" onClick={() => updater.apply()} className="w-full py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white">
          Aplicar agora
        </button>
      ) : (
        <button
          type="button"
          onClick={handleCheck}
          disabled={phase === 'checking' || phase === 'installing'}
          className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 disabled:opacity-60"
        >
          {phase === 'checking' ? 'Buscando...' : phase === 'installing' ? 'Baixando...' : 'Buscar atualizações'}
        </button>
      )}
    </div>
  );
};
