import type { LanyardData } from "react-use-lanyard"

const statusTextMap = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline"
}

export function OnlineStatus({ activity }: { activity: LanyardData }) {
    return <div className="absolute top-[1.95rem] right-7 flex items-center border border-black/20 dark:border-white/20 rounded-full px-2 py-[1px]">
        <div className={`w-2 h-2 rounded-full ${activity.discord_status === "online" ? "bg-green-500" :
            activity.discord_status === "idle" ? "bg-yellow-500" :
                activity.discord_status === "dnd" ? "bg-red-500" :
                    activity.discord_status === "offline" && "bg-gray-500"}`} />
        <span className="ml-2 text-xs font-semibold text-theme-foreground dark:text-white">{statusTextMap[activity.discord_status]}</span>
    </div>
}