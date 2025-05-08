import React from "react";

type Props = {
    selected: string;
};

export default function SettingsPanel({ selected }: Props) {
    return (
        <section className="ml-64 pt-20 pl-8 pr-8 bg-white dark:bg-background min-h-[calc(100vh-4rem)] overflow-y-auto">
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
        </section>
    );
}
