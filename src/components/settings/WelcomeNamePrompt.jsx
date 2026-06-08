import { useState } from "react";
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!valid || saving) return;
        setSaving(true);
        await updateSetting("userName", name.trim());
        setSaving(false);
    };

    return (
        <Drawer open={open} dismissible={false}>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader className="text-center pt-8">
                        <DrawerTitle className="text-2xl font-black tracking-tight">Bienvenue sur Trackly</DrawerTitle>
                        <DrawerDescription>Comment souhaitez-vous qu&apos;on vous appelle ?</DrawerDescription>
                    </DrawerHeader>
                    <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Votre prénom"
                            autoFocus
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
