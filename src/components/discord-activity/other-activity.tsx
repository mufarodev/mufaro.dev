import type { Activity } from "react-use-lanyard";
import { timestampToRelativeTime, trimToLength } from "../../util";
import { Clock } from "lucide-react";

export function OtherActivity({ activity }: { activity: Activity }) {
    const getImageUrl = (imageUrl: string | undefined) => {
        if (!imageUrl) return "https://i.imgur.com/j1HAfFJ.png";

        if (imageUrl.startsWith('mp:external/')) {
            const matches = imageUrl.match(/mp:external\/[^/]+\/(.+)/);
            if (matches && matches[1]) {
                let extractedUrl = matches[1];
                if (extractedUrl.startsWith('https/'))
                    extractedUrl = extractedUrl.replace('https/', 'https://');
                return extractedUrl;
            }
        }

        if (imageUrl.startsWith('https://cdn.discordapp.com'))
            return imageUrl;

        return imageUrl;
    };

    const largeImage = getImageUrl(activity.assets?.large_image);

    return <div className="flex items-center">
        <img src={largeImage} alt="status image" className="w-16 h-16 rounded-lg mr-2">
        </img>
        <div className="flex flex-col">
            <p className="text-sm font-bold text-theme-foreground dark:text-white">{activity.name}</p>
            <p className="text-xs text-theme-foreground-secondary dark:text-white/70">{trimToLength(activity.details || "", 55)}</p>
            <p className="text-xs text-theme-foreground-secondary dark:text-white/70">{trimToLength(activity.state || "", 55)}</p>
            <p className="text-xs text-theme-foreground-contrast dark:text-indigo-400 font-bold flex items-center gap-2 ">
                <Clock size={12} strokeWidth={3} />
                <span>{timestampToRelativeTime(activity.timestamps?.start!)}</span>
            </p>
        </div>
    </div>
}