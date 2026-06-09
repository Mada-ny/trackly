import { useState, useEffect, useRef } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings, updateSetting } from "@/utils/db/hooks/useSettings";

export default function WelcomeNamePrompt() {
    const settings = useSettings();
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    const open = settings != null && !settings.userName;
    const valid = name.trim().length >= 2;

    const [kbHeight, setKbHeight] = useState(0);
    const inputRef = useRef(null);

    // Réinitialise kbHeight à la fermeture (pattern "ajuster l'état pendant le rendu")
    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (!open) setKbHeight(0);
    }

    // Remonte le drawer au-dessus du clavier natif en surchargeant bottom: 0 (iOS/Android).
    // On focus le champ ICI (pas via autoFocus) pour garantir que le listener est déjà actif
    // quand le clavier apparaît — sinon le premier resize est manqué.
    useEffect(() => {
        if (!open) return;
        const vv = window.visualViewport;
        if (!vv) return;
        const onVvChange = () => {
            const h = window.innerHeight - vv.height;
            setKbHeight(h > 80 ? h : 0);
        };
        const onWindowScroll = () => window.scrollTo(0, 0);
        vv.addEventListener('resize', onVvChange);
        window.addEventListener('scroll', onWindowScroll, { passive: true });
        inputRef.current?.focus();
        return () => {
            vv.removeEventListener('resize', onVvChange);
            window.removeEventListener('scroll', onWindowScroll);
        };
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!valid || saving) return;
        setSaving(true);
        await updateSetting("userName", name.trim());
        setSaving(false);
    };

    return (
        <Drawer open={open} dismissible={false}>
            <DrawerContent style={{ bottom: kbHeight }}>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader className="text-center pt-8">
                        <DrawerTitle className="text-2xl font-black tracking-tight">Bienvenue sur Trackly</DrawerTitle>
                        <DrawerDescription>Comment souhaitez-vous qu&apos;on vous appelle ?</DrawerDescription>
                    </DrawerHeader>
                    <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
                        <Input
                            ref={inputRef}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Votre prénom"
                            className="h-12 rounded-2xl text-base text-center"
                        />
                        <Button type="submit" disabled={!valid || saving} className="w-full h-12 rounded-2xl font-bold">
                            Continuer
                        </Button>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
