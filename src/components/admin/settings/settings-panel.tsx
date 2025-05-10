import React from "react";

type Props = {
    selected: string;
};

export default function SettingsPanel({ selected }: Props) {
    return (
        <section className="ml-64 md:ml-[18rem] flex flex-col bg-white dark:bg-background min-h-[calc(100vh-4rem)] rounded-xl shadow mt-16 p-0 border border-border">
            <header className="px-8 pt-8 pb-4 border-b border-border">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
            </header>
            <div className="flex-1 px-8 py-6">
                {/* You can use a switch or map to render different config UIs */}
                {(() => {
                    switch (selected) {
                        case "display":
                            return <div className="text-xl font-semibold">Display Settings</div>;
                        case "sound":
                            return <div className="text-xl font-semibold">Sound Settings</div>;
                        // ...add more cases
                        default:
                            return <div className="text-lg text-muted-foreground">Select a setting from the left.</div>;
                    }
                })()}
            </div>
        </section>
    );
}
