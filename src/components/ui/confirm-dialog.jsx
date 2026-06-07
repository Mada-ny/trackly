import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { hexA } from "@/utils/ui/colors";

export function ConfirmDialog({ open, onOpenChange, icon: Icon, title, body, confirmLabel, danger = true, onConfirm, single = false }) {
    const accent = danger ? "#b4623f" : "#3f6f63";
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-[26px] border-none max-w-[340px] p-6 text-center">
                <AlertDialogHeader className="items-center text-center gap-3">
                    {Icon && (
                        <div style={{
                            width: 52, height: 52, borderRadius: 16,
                            background: hexA(accent, 0.13), color: accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Icon size={26} strokeWidth={1.9} />
                        </div>
                    )}
                    <AlertDialogTitle style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.1 }}>
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription style={{ font: '460 13.5px/1.5 var(--sans)', color: 'var(--ink-soft)' }}>
                        {body}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    {!single && (
                        <AlertDialogCancel style={{
                            flex: 1, height: 50, borderRadius: 15, border: '1px solid var(--line)',
                            background: 'var(--surface)', color: 'var(--ink)', font: '600 14.5px var(--sans)',
                        }}>Annuler</AlertDialogCancel>
                    )}
                    <AlertDialogAction
                        onClick={onConfirm}
                        style={{
                            flex: 1, height: 50, borderRadius: 15, border: 'none', font: '650 14.5px var(--sans)',
                            background: danger ? 'var(--clay)' : 'var(--pine)', color: '#fff',
                        }}
                    >{confirmLabel || 'Confirmer'}</AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
