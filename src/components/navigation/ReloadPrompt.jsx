import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'
import { RefreshCw, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      // eslint-disable-next-line no-console
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      // eslint-disable-next-line no-console
      console.error('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-foreground text-background p-4 rounded-3xl shadow-2xl flex flex-col gap-4 border border-white/10 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/20 rounded-xl text-primary shrink-0">
            {offlineReady ? <Sparkles className="w-5 h-5" /> : <RefreshCw className="w-5 h-5 animate-spin-slow" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black uppercase tracking-tight leading-snug">
              {offlineReady ? "Prêt pour l'offline !" : "Mise à jour disponible"}
            </p>
            <p className="text-[10px] opacity-70 font-medium">
              {offlineReady 
                ? "L'application est maintenant disponible hors-ligne." 
                : "Une nouvelle version de Trackly est prête à être installée."}
            </p>
          </div>
          <button onClick={close} className="p-1 opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>

        {needRefresh && (
          <div className="flex gap-2">
            <Button 
              onClick={() => updateServiceWorker(true)}
              className="grow bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] h-10 rounded-2xl"
            >
              Mettre à jour
            </Button>
            <Button 
              variant="outline" 
              onClick={close}
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-2xl"
            >
              Plus tard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
