import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X, Sparkles } from 'lucide-react'
import { hexA } from '@/utils/ui/colors'

/**
 * Composant pour gérer les notifications de mise à jour du Service Worker.
 * Affiche une bannière flottante quand une nouvelle version est disponible.
 */
export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div
      className="animate-in slide-in-from-bottom-10 duration-500"
      style={{ position: 'fixed', bottom: 96, left: 16, right: 16, zIndex: 100 }}
    >
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 24,
        boxShadow: '0 12px 34px rgba(40,34,24,0.14)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 13, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: hexA('#3f6f63', 0.12), color: 'var(--pine)',
          }}>
            {offlineReady
              ? <Sparkles size={18} strokeWidth={2} />
              : <RefreshCw size={18} strokeWidth={2} className="animate-spin" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ font: '650 14px var(--sans)', color: 'var(--ink)', margin: 0 }}>
              {offlineReady ? "Prêt pour l'offline !" : "Mise à jour disponible"}
            </p>
            <p style={{ font: '460 12px var(--sans)', color: 'var(--ink-soft)', margin: '3px 0 0' }}>
              {offlineReady
                ? "L'application est maintenant disponible hors-ligne."
                : "Une nouvelle version de Trackly est prête à être installée."}
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Fermer"
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: 'var(--ink-muted)', display: 'flex' }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {needRefresh && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => updateServiceWorker(true)}
              style={{
                flex: 1, height: 42, borderRadius: 16, border: 'none', cursor: 'pointer',
                background: 'var(--pine)', color: '#fff',
                font: '650 12.5px var(--sans)', letterSpacing: 0.2,
              }}
            >
              Mettre à jour
            </button>
            <button
              onClick={close}
              style={{
                flex: 1, height: 42, borderRadius: 16, cursor: 'pointer',
                border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)',
                font: '650 12.5px var(--sans)', letterSpacing: 0.2,
              }}
            >
              Plus tard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
