import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Download, Upload, Trash2, AlertTriangle, Database } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAccounts, useTransactions, useSettings } from "@/utils/db/hooks";
import { updateSetting } from "@/utils/db/hooks/useSettings";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { exportDatabase, importDatabase } from "@/utils/db/importExport";
import { db } from "@/utils/db/schema";
import { hexA } from "@/utils/ui/colors";
import { toast } from "sonner";

const primaryBtn = {
    width: '100%', height: 50, borderRadius: 15, border: 'none', cursor: 'pointer', background: 'var(--pine)', color: '#fff',
    font: '600 14.5px var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 18px rgba(44,84,72,0.24)',
};

const outlineBtn = {
    width: '100%', height: 50, borderRadius: 15, border: '1px solid var(--line)', cursor: 'pointer', background: 'var(--surface)', color: 'var(--ink)',
    font: '600 14.5px var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};

function DataCard({ icon: Icon, color, title, desc, children }) {
    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 22, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: hexA(color, 0.13), color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={20} strokeWidth={1.8} /></span>
                <span style={{ font: '650 16px var(--sans)', color: 'var(--ink)' }}>{title}</span>
            </div>
            <p style={{ font: '460 13px/1.5 var(--sans)', color: 'var(--ink-soft)', margin: '0 0 16px' }}>{desc}</p>
            {children}
        </div>
    );
}

export default function DataManagementPage() {
    const navigate = useNavigate();
    const accounts = useAccounts();
    const transactions = useTransactions();
    const settings = useSettings();

    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);
    const [pickedFile, setPickedFile] = useState(null);
    const [confirmImport, setConfirmImport] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);

    const lastBackup = settings?.lastBackupAt
        ? format(new Date(settings.lastBackupAt), "d MMMM yyyy", { locale: fr })
        : "jamais";

    const handleExport = async () => {
        try {
            await exportDatabase();
            await updateSetting("lastBackupAt", new Date().toISOString());
            toast.success("Données exportées avec succès.");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'exportation.");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setPickedFile(file);
        setConfirmImport(true);
    };

    const runImport = async () => {
        if (!pickedFile) return;
        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const content = e.target?.result;
                const data = JSON.parse(content);

                await importDatabase(data, true);
                toast.success("Données importées avec succès !");
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                console.error(error);
                toast.error("Échec de l'import : Format de fichier invalide.");
            } finally {
                setIsImporting(false);
                setPickedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };

        reader.readAsText(pickedFile);
    };

    const handleReset = async () => {
        try {
            await db.transaction("rw", [db.accounts, db.categories, db.transactions], async () => {
                await db.transactions.clear();
                await db.categories.clear();
                await db.accounts.clear();
            });
            await db.delete();
            toast.success("Application réinitialisée.");
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la réinitialisation.");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
            <div style={{ flexShrink: 0, padding: '56px 20px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                    <button onClick={() => navigate('/settings')} aria-label="Retour" style={{
                        width: 40, height: 40, borderRadius: 13, border: '1px solid var(--line)', background: 'var(--surface)',
                        color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}><ChevronLeft size={20} strokeWidth={2} /></button>
                </div>
                <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, color: 'var(--ink)', margin: 0, lineHeight: 1 }}>Données</h1>
                <div style={{ font: '480 13px var(--sans)', color: 'var(--ink-muted)', marginTop: 7 }}>
                    Sauvegardez et restaurez vos données locales
                </div>
            </div>

            <div className="no-sb" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 20px 40px' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'linear-gradient(150deg, var(--hero), oklch(0.26 0.03 168))', borderRadius: 22, padding: '18px 18px',
                    color: '#f4f1e8', marginBottom: 20,
                }}>
                    <span style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(244,241,232,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Database size={24} strokeWidth={1.7} />
                    </span>
                    <div style={{ flex: 1 }}>
                        <div style={{ font: '600 14px var(--sans)' }}>{transactions.length} transaction{transactions.length > 1 ? 's' : ''} · {accounts.length} compte{accounts.length > 1 ? 's' : ''}</div>
                        <div style={{ font: '460 12px var(--sans)', opacity: 0.78, marginTop: 3 }}>Stockées sur cet appareil · 100% hors-ligne</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <DataCard icon={Download} color="#5b76b0" title="Exporter mes données" desc="Téléchargez une sauvegarde complète (transactions, comptes et catégories) au format JSON.">
                        <button onClick={handleExport} style={primaryBtn}><Download size={18} strokeWidth={2} /> Générer une sauvegarde</button>
                        <div style={{ font: '460 11.5px var(--sans)', color: 'var(--ink-muted)', marginTop: 12, textAlign: 'center' }}>Dernière sauvegarde · {lastBackup}</div>
                    </DataCard>

                    <DataCard icon={Upload} color="#b08a4f" title="Importer une sauvegarde" desc="Restaurez vos données depuis un fichier exporté.">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: hexA('#b4623f', 0.08), border: '1px solid ' + hexA('#b4623f', 0.2), borderRadius: 12, padding: '10px 12px', marginBottom: 14 }}>
                            <span style={{ color: 'var(--clay)', display: 'flex', flexShrink: 0 }}><AlertTriangle size={16} strokeWidth={1.9} /></span>
                            <span style={{ font: '500 12px/1.4 var(--sans)', color: 'var(--clay)' }}>Cela remplacera toutes vos données actuelles.</span>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
                        <button onClick={handleImportClick} style={outlineBtn} disabled={isImporting}>
                            <Upload size={18} strokeWidth={2} /> {isImporting ? "Importation..." : "Charger un fichier JSON"}
                        </button>
                    </DataCard>
                </div>

                <div style={{ marginTop: 28 }}>
                    <div style={{ font: '600 11px var(--sans)', color: 'var(--clay)', letterSpacing: 1, textTransform: 'uppercase', margin: '0 2px 11px' }}>Zone sensible</div>
                    <div style={{ background: hexA('#b4623f', 0.05), border: '1px solid ' + hexA('#b4623f', 0.2), borderRadius: 22, padding: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 8 }}>
                            <span style={{ width: 38, height: 38, borderRadius: 12, background: hexA('#b4623f', 0.12), color: 'var(--clay)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Trash2 size={19} strokeWidth={1.8} /></span>
                            <span style={{ font: '650 15px var(--sans)', color: 'var(--clay)' }}>Réinitialiser l&apos;application</span>
                        </div>
                        <p style={{ font: '460 12.5px/1.5 var(--sans)', color: 'var(--ink-soft)', margin: '0 0 14px' }}>Supprime définitivement toutes les données. L&apos;application revient à son état initial.</p>
                        <button onClick={() => setConfirmReset(true)} style={{ ...outlineBtn, borderColor: hexA('#b4623f', 0.3), color: 'var(--clay)' }}>Effacer tout le contenu</button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmImport}
                onOpenChange={(o) => { if (!o) { setConfirmImport(false); setPickedFile(null); } }}
                icon={Upload}
                danger
                title="Confirmer l'import"
                body={`« ${pickedFile?.name || 'fichier.json'} » — vos données actuelles seront remplacées. Cette action est irréversible.`}
                confirmLabel="Importer"
                onConfirm={runImport}
            />

            <ConfirmDialog
                open={confirmReset}
                onOpenChange={setConfirmReset}
                icon={AlertTriangle}
                danger
                title="Tout supprimer ?"
                body="Voulez-vous vraiment effacer toutes vos données ? Cette action ne peut pas être annulée."
                confirmLabel="Réinitialiser"
                onConfirm={handleReset}
            />
        </div>
    );
}
