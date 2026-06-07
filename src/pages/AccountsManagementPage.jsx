import { useState, useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Search, X, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useAccounts } from "@/utils/db/hooks";
import { GlyphChip } from "@/components/ui/glyph-chip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import AccountForm from "@/components/accounts/AccountForm";
import { getAccountVisuals } from "@/utils/ui/iconMap";
import { useCurrency } from "@/utils/number/CurrencyProvider";
import { db } from "@/utils/db/schema";
import { toast } from "sonner";

const iconBtn = {
    width: 38, height: 38, borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
    color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

export default function AccountsManagementPage() {
    const navigate = useNavigate();
    const accounts = useAccounts();
    const { formatCurrency } = useCurrency();

    const [query, setQuery] = useState("");
    const deferredQuery = useDeferredValue(query);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [toDelete, setToDelete] = useState(null);
    const [blocked, setBlocked] = useState(null);

    const filtered = accounts.filter((a) => a.name.toLowerCase().includes(deferredQuery.toLowerCase()));
    const total = accounts.reduce((sum, a) => sum + a.initialBalance, 0);

    const openAdd = () => { setEditing(null); setFormOpen(true); };
    const openEdit = (account) => { setEditing(account); setFormOpen(true); };

    const askDelete = async (account) => {
        const count = await db.transactions.where("accountId").equals(account.id).count();
        if (count > 0) setBlocked({ account, count });
        else setToDelete(account);
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        try {
            await db.accounts.delete(toDelete.id);
            toast.success("Compte supprimé");
            setToDelete(null);
        } catch (error) {
            toast.error("Erreur lors de la suppression");
            console.error(error);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
            <div style={{ flexShrink: 0, padding: '56px 20px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <button onClick={() => navigate('/settings')} aria-label="Retour" style={{
                        width: 40, height: 40, borderRadius: 13, border: '1px solid var(--line)', background: 'var(--surface)',
                        color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}><ChevronLeft size={20} strokeWidth={2} /></button>
                    <button onClick={openAdd} style={{
                        height: 40, padding: '0 15px 0 12px', borderRadius: 13, border: 'none', background: 'var(--pine)', color: '#fff',
                        display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', font: '600 13.5px var(--sans)',
                        boxShadow: '0 6px 16px rgba(44,84,72,0.26)',
                    }}><Plus size={17} strokeWidth={2.4} /> Ajouter</button>
                </div>
                <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, color: 'var(--ink)', margin: 0, lineHeight: 1 }}>Mes comptes</h1>
                <div style={{ font: '480 13px var(--sans)', color: 'var(--ink-muted)', marginTop: 7 }}>
                    {accounts.length} compte{accounts.length > 1 ? 's' : ''} · solde total {formatCurrency(total)}
                </div>
            </div>

            <div className="no-sb" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 20px 40px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                    <span style={{ position: 'absolute', left: 14, color: 'var(--ink-muted)', display: 'flex' }}><Search size={18} strokeWidth={1.8} /></span>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher un compte…"
                        style={{
                            width: '100%', boxSizing: 'border-box', height: 46, paddingLeft: 42, paddingRight: 38, borderRadius: 15,
                            border: '1px solid var(--line)', background: 'var(--surface)', font: '500 14.5px var(--sans)', color: 'var(--ink)', outline: 'none',
                        }}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 12, border: 'none', background: 'none', color: 'var(--ink-muted)', cursor: 'pointer', display: 'flex', padding: 4 }}>
                            <X size={16} strokeWidth={2} />
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                    {filtered.map((account) => {
                        const { icon, color } = getAccountVisuals(account);
                        return (
                            <div key={account.id} style={{
                                display: 'flex', alignItems: 'center', gap: 13, background: 'var(--surface)',
                                border: '1px solid var(--line)', borderRadius: 20, padding: '14px 14px 14px 15px',
                            }}>
                                <GlyphChip icon={icon} color={color} size={44} radius={14} soft={0.13} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ font: '650 15px var(--sans)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account.name}</div>
                                    <div style={{ font: '500 12px var(--sans)', color: 'var(--ink-muted)', marginTop: 3 }}>{account.kind || 'Compte'} · {formatCurrency(account.initialBalance)}</div>
                                </div>
                                <button onClick={() => openEdit(account)} style={iconBtn}><Pencil size={17} strokeWidth={1.8} /></button>
                                <button onClick={() => askDelete(account)} style={{ ...iconBtn, color: 'var(--clay)' }}><Trash2 size={17} strokeWidth={1.8} /></button>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--ink-muted)', font: '460 14px var(--sans)', fontStyle: 'italic' }}>
                            {query ? 'Aucun compte ne correspond.' : 'Aucun compte configuré.'}
                        </div>
                    )}
                </div>
            </div>

            <Drawer open={formOpen} onOpenChange={setFormOpen}>
                <DrawerContent aria-describedby={undefined} style={{ maxHeight: '92dvh' }}>
                    <div className="no-sb mx-auto w-full max-w-sm px-4 pb-8" style={{ overflowY: 'auto', minHeight: 0 }}>
                        <DrawerHeader className="px-0">
                            <DrawerTitle style={{ fontFamily: 'var(--serif)', fontSize: 25, fontWeight: 700, color: 'var(--ink)', textAlign: 'left' }}>{editing ? 'Modifier le compte' : 'Nouveau compte'}</DrawerTitle>
                            <DrawerDescription style={{ font: '460 13px var(--sans)', color: 'var(--ink-muted)', textAlign: 'left' }}>Nom, type et solde de départ.</DrawerDescription>
                        </DrawerHeader>
                        <div className="py-4">
                            <AccountForm account={editing} onSuccess={() => setFormOpen(false)} onCancel={() => setFormOpen(false)} />
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            <ConfirmDialog
                open={!!toDelete}
                onOpenChange={(o) => !o && setToDelete(null)}
                icon={Trash2}
                danger
                title="Supprimer le compte ?"
                body={`« ${toDelete?.name} » sera définitivement supprimé. Cette action est irréversible.`}
                confirmLabel="Supprimer"
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={!!blocked}
                onOpenChange={(o) => !o && setBlocked(null)}
                icon={AlertTriangle}
                danger
                single
                title="Suppression impossible"
                body={`Ce compte contient ${blocked?.count} transaction${blocked?.count > 1 ? 's' : ''}. Déplacez-les ou supprimez-les d'abord.`}
                confirmLabel="Compris"
            />
        </div>
    );
}
