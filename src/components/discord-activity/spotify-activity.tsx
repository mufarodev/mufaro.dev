import { useEffect, useState } from "react"
import type { LanyardData } from "react-use-lanyard"
import { formatDuration } from "./discord-activity"

export function SpotifyActivity({ activity }: { activity: LanyardData }) {
    const image = activity.spotify?.album_art_url
    const song = activity.spotify?.song
    const artist = activity.spotify?.artist
    const timestamps = activity.spotify?.timestamps
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState("0:00")

    const calculateProgress = () => {
        if (timestamps) {
            const start = new Date(timestamps.start).getTime()
            const end = new Date(timestamps.end).getTime()
            const current = new Date().getTime()
            const progress = ((current - start) / (end - start)) * 100
            return Math.round(progress)
        }
        return 0
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const start = new Date(timestamps!.start).getTime()
            const current = new Date().getTime()
            const elapsed = current - start
            setCurrentTime(formatDuration(elapsed))
            setProgress(calculateProgress());
        }, 1000);

        return () => clearInterval(timer);
    }, [timestamps]);


    return <div className="flex flex-col">
        <div className="flex items-center">
            <img src={image} alt="Spotify Album Art" className="w-10 h-10 rounded-lg mr-2" />
            <div className="flex flex-col">
                <p className="text-sm font-bold text-theme-foreground dark:text-white">{song}</p>
                <p className="text-xs text-theme-foreground-secondary dark:text-white/70">{artist}</p>
            </div>
        </div>
        <div className="w-full bg-black/10 dark:bg-white/15 rounded-full h-[6px] mt-2">
            <div className={`bg-gradient-to-r from-indigo-500/40 to-purple-500/40 dark:from-purple-500/20 dark:to-pink-500/20 h-full rounded-full`} style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-xs text-theme-foreground-secondary dark:text-gray-300 mt-1 font-bold">
            {timestamps && <p>{currentTime}</p>}
            {timestamps && <p>{formatDuration(timestamps.end - timestamps.start)}</p>}
        </div>
    </div>
}