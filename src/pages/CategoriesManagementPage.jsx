import { useState, useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Search, X, Pencil, Trash2, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { useCategories } from "@/utils/db/hooks";
import { GlyphChip } from "@/components/ui/glyph-chip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import CategoryForm from "@/components/categories/CategoryForm";
import { getCategoryVisuals } from "@/utils/ui/iconMap";
import { useCurrency } from "@/utils/number/CurrencyProvider";
import { db } from "@/utils/db/schema";
import { toast } from "sonner";

const iconBtn = {
    width: 38, height: 38, borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
    color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

export default function CategoriesManagementPage() {
    const navigate = useNavigate();
    const categories = useCategories();
    const { formatCurrency } = useCurrency();

    const [query, setQuery] = useState("");
    const deferredQuery = useDeferredValue(query);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [toDelete, setToDelete] = useState(null);
    const [blocked, setBlocked] = useState(null);

    const filtered = categories.filter((c) => c.name !== "Transfert" && c.name.toLowerCase().includes(deferredQuery.toLowerCase()));
    const expense = filtered.filter((c) => c.type === "expense");
    const income = filtered.filter((c) => c.type === "income");
    const hasResults = expense.length > 0 || income.length > 0;

    const openAdd = () => { setEditing(null); setFormOpen(true); };
    const openEdit = (category) => { setEditing(category); setFormOpen(true); };

    const askDelete = async (category) => {
        const count = await db.transactions.where("categoryId").equals(category.id).count();
        if (count > 0) setBlocked({ category, count });
        else setToDelete(category);
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        try {
            await db.categories.delete(toDelete.id);
            toast.success("Catégorie supprimée");
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
                <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, color: 'var(--ink)', margin: 0, lineHeight: 1 }}>Mes catégories</h1>
                <div style={{ font: '480 13px var(--sans)', color: 'var(--ink-muted)', marginTop: 7 }}>
                    {filtered.length} catégorie{filtered.length > 1 ? 's' : ''} · dépenses & revenus
                </div>
            </div>

            <div className="no-sb" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 20px 40px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                    <span style={{ position: 'absolute', left: 14, color: 'var(--ink-muted)', display: 'flex' }}><Search size={18} strokeWidth={1.8} /></span>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher une catégorie…"
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

                {expense.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <GroupLabel icon={TrendingDown} color="#b4623f">Dépenses</GroupLabel>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                            {expense.map((category) => (
                                <CategoryRow key={category.id} category={category} formatCurrency={formatCurrency} onEdit={openEdit} onDelete={askDelete} />
                            ))}
                        </div>
                    </div>
                )}

                {income.length > 0 && (
                    <div>
                        <GroupLabel icon={TrendingUp} color="#3f6f63">Revenus</GroupLabel>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                            {income.map((category) => (
                                <CategoryRow key={category.id} category={category} formatCurrency={formatCurrency} onEdit={openEdit} onDelete={askDelete} />
                            ))}
                        </div>
                    </div>
                )}

                {!hasResults && (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--ink-muted)', font: '460 14px var(--sans)', fontStyle: 'italic' }}>
                        {query ? 'Aucune catégorie ne correspond.' : 'Aucune catégorie configurée.'}
                    </div>
                )}
            </div>

            <Drawer open={formOpen} onOpenChange={setFormOpen}>
                <DrawerContent aria-describedby={undefined} style={{ maxHeight: '92dvh' }}>
                    <div className="no-sb mx-auto w-full max-w-sm px-4 pb-8" style={{ overflowY: 'auto', minHeight: 0 }}>
                        <DrawerHeader className="px-0">
                            <DrawerTitle style={{ fontFamily: 'var(--serif)', fontSize: 25, fontWeight: 700, color: 'var(--ink)', textAlign: 'left' }}>{editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DrawerTitle>
                            <DrawerDescription style={{ font: '460 13px var(--sans)', color: 'var(--ink-muted)', textAlign: 'left' }}>Personnalisez pour mieux analyser vos dépenses.</DrawerDescription>
                        </DrawerHeader>
                        <div className="py-4">
                            <CategoryForm category={editing} onSuccess={() => setFormOpen(false)} onCancel={() => setFormOpen(false)} />
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            <ConfirmDialog
                open={!!toDelete}
                onOpenChange={(o) => !o && setToDelete(null)}
                icon={Trash2}
                danger
                title="Supprimer la catégorie ?"
                body={`« ${toDelete?.name} » sera définitivement supprimée.`}
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
                body={`${blocked?.count} transaction${blocked?.count > 1 ? 's' : ''} utilise${blocked?.count > 1 ? 'nt' : ''} cette catégorie. Déplacez-les ou supprimez-les d'abord.`}
                confirmLabel="Compris"
            />
        </div>
    );
}

function GroupLabel({ icon: Icon, color, children }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '0 2px 11px' }}>
            <span style={{ color, display: 'flex' }}><Icon size={15} strokeWidth={2} /></span>
            <span style={{ font: '600 11px var(--sans)', color: 'var(--ink-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>{children}</span>
        </div>
    );
}

function CategoryRow({ category, formatCurrency, onEdit, onDelete }) {
    const { icon, color } = getCategoryVisuals(category);
    const isSystem = category.name === "Transfert";
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 13, background: 'var(--surface)',
            border: '1px solid var(--line)', borderRadius: 18, padding: '12px 12px 12px 13px',
        }}>
            <GlyphChip icon={icon} color={color} size={40} radius={13} soft={0.13} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '650 14.5px var(--sans)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{category.name}</div>
                {category.monthlyLimit ? (
                    <div style={{ font: '500 11.5px var(--sans)', color: 'var(--ink-muted)', marginTop: 2 }}>Plafond {formatCurrency(category.monthlyLimit)}/mois</div>
                ) : null}
            </div>
            <button onClick={() => onEdit(category)} style={iconBtn}><Pencil size={16} strokeWidth={1.8} /></button>
            {!isSystem && (
                <button onClick={() => onDelete(category)} style={{ ...iconBtn, color: 'var(--clay)' }}><Trash2 size={16} strokeWidth={1.8} /></button>
            )}
        </div>
    );
}
