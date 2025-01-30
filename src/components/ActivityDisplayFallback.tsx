import { WindowActivityChart } from "./WindowActivityChart";

export function ActivityDisplayFallback() {
    return (
        <div className="space-y-6 text-white">
            <div className="min-h-[300px] min-w-[300px]">
                <WindowActivityChart data={[]} />
            </div>
            <div className="w-full flex justify-around">
                Loading...
            </div>
        </div>
    )
}