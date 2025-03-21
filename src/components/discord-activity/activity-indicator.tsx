import type { LanyardData } from "react-use-lanyard"
import { SpotifyActivity } from "./spotify-activity"
import { OnlineStatus } from "./online-status"
import { OtherActivity } from "./other-activity"

export function ActivityIndicator({ activity }: { activity: LanyardData }) {
    const noCustomActivity = activity.activities.filter(a => a.id != "custom")

    return <div className="w-full h-full">
        <OnlineStatus activity={activity} />
        {noCustomActivity.length > 0 ?
            <div className="flex flex-col">
                {noCustomActivity[0].name == "Spotify" ?
                    <SpotifyActivity activity={activity} /> :
                    <OtherActivity activity={noCustomActivity[0]} />
                }
            </div>
            : <p className="text-theme-foreground dark:text-white">No activity</p>
        }
    </div>
}