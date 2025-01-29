import { WindowActivityChart } from "./WindowActivityChart";

export function ActivityDisplayFallback() {
    return (
        <div className="space-y-6 text-white">
            <div className="min-h-[300px] min-w-[300px]">
                <WindowActivityChart data={[]} />
            </div>
            <div className="w-full flex justify-around">
                <div className="space-y-1">
                    <div className="text-sm geist-mono text-theme-foreground opacity-90">Mouse Movement</div>
                    <div className="text-text-foreground geist-mono text-3xl">
                        0.00 
                        <span className="ml-2 text-base text-text-foreground opacity-90">
                            meters
                        </span>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="text-sm geist-mono text-theme-foreground opacity-90">Left Clicks</div>
                    <div className="text-text-foreground text-3xl">0</div>
                </div>
                <div className="space-y-1">
                    <div className="text-sm geist-mono text-theme-foreground opacity-90">Right Clicks</div>
                    <div className="text-text-foreground text-3xl">0</div>
                </div>
                <div className="space-y-1">
                    <div className="text-sm geist-mono text-theme-foreground opacity-90">Keypresses</div>
                    <div className="text-text-foreground text-3xl">0</div>
                </div>
            </div>
        </div>
    )
}