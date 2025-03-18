import type { JSX } from "react/jsx-runtime";
import type { ActivityTrack, MouseActivity, WindowActivity } from "../../types";
import { WindowActivityChart } from "./WindowActivityChart";
import { InputDataCartesianChart } from "./InputDataCartesianChart";

interface ActivityDisplayProps {
    activity: Array<ActivityTrack>,
    totalActivity: ActivityTrack
}

function abbreviateNumber(value: number) {
    const num = Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
    return num;
}


export function ActivityDisplay({ activity, totalActivity }: ActivityDisplayProps) {
    return (
        <div className="space-y-6 text-white">
            <div className="min-h-[350px] min-w-[300px]">
                <WindowActivityChart data={totalActivity.window_activity} />
            </div>
            <div className="w-full flex justify-around">
                <div className="space-y-1">
                    <div className="text-sm geist-mono text-theme-foreground opacity-90">Mouse Movement</div>
                    <div className="text-text-foreground geist-mono text-3xl">
                        {abbreviateNumber(totalActivity.mouse_activity.totalMouseDistance)} 
                        <span className="ml-2 text-base text-text-foreground opacity-90">
                            meters
                        </span>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="text-sm geist-mono text-theme-foreground opacity-90">Left Clicks</div>
                    <div className="text-text-foreground geist-mono text-3xl">{abbreviateNumber(totalActivity.mouse_activity.leftClicks)}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-sm geist-mono text-theme-foreground opacity-90">Right Clicks</div>
                    <div className="text-text-foreground geist-mono text-3xl">{abbreviateNumber(totalActivity.mouse_activity.rightClicks)}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-sm geist-mono text-theme-foreground opacity-90">Keypresses</div>
                    <div className="text-text-foreground geist-mono text-3xl">{abbreviateNumber(totalActivity.keyboard_presses)}</div>
                </div>
            </div>
            <div className="w-full max-h-[300px] pr-4 pt-4">
                <InputDataCartesianChart data={activity} />
            </div>
        </div>
    )
}