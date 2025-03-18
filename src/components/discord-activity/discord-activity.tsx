import { useEffect, useState } from "react";
import { useLanyard, type LanyardData } from "react-use-lanyard";
import { LoaderCircle } from "lucide-react"
import { ActivityIndicator } from "./activity-indicator";

export function DiscordActivity() {
    const [lanyardData, setLanyardData] = useState<LanyardData | null>(null);

    const { loading, status, websocket } = useLanyard({
        userId: "769702535124090904",
        socket: true
    })


    useEffect(() => {
        if (status) {
            setLanyardData(status)
        }
    }, [loading, status])

    return <div className="text-gray-300 text-sm mt-2">
        {
            (loading && !lanyardData) ? <LoadingIndicator /> :
                (!loading && !lanyardData) ? <ErrorIndicator /> :
                lanyardData && <ActivityIndicator activity={lanyardData} />
        }
    </div>
}

function LoadingIndicator() {
    return <div className="animate-spin w-fit h-fit p-0 m-0">
        <LoaderCircle size={20} />
    </div>
}

function ErrorIndicator() {
    return <div className="text-red-500">
        <p>Something went wrong while fetching Discord activity.</p>
    </div>
}

export function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

