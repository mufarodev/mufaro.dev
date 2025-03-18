import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import type { ActivityTrack, NormalizedInputData } from "../../types"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/charts"
import { normalizeInputData } from "../../util"

type InputDataCartesianChartProps = {
    data: ActivityTrack[]
}

const chartConfig = {
    keyboard_presses: {
        label: "Keyboard Presses",
    },
    leftClicks: {
        label: "Left Clicks",
    },
    rightClicks: {
        label: "Right Clicks",
    },
    totalMouseDistance: {
        label: "Mouse Distance",
    },
} satisfies ChartConfig

export function InputDataCartesianChart({ data }: InputDataCartesianChartProps) {
    const normalizedData = normalizeInputData(data);
    console.log('Normalized data:', normalizedData);
    
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 20) * 20;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    now.setMilliseconds(0);

    const past24h = new Date(now);
    past24h.setDate(past24h.getDate() - 1);
    
    const roundTo20Minutes = (timestamp: number) => {
        const date = new Date(timestamp);
        const minutes = date.getMinutes();
        const roundedMinutes = Math.floor(minutes / 20) * 20;
        const roundedTime = new Date(date);
        roundedTime.setMinutes(roundedMinutes);
        roundedTime.setSeconds(0);
        roundedTime.setMilliseconds(0);

        if (roundedTime.getTime() > Date.now()) {
            roundedTime.setMinutes(roundedMinutes - 20);
        }

        return roundedTime.getTime();
    };

    const timelineData = Array.from({length: 72}, (_, i) => ({
        snapshot_time: roundTo20Minutes(past24h.getTime() + (i * 20 * 60 * 1000)),
        keyboard_presses: 0,
        totalMouseDistance: 0,
        rightClicks: 0,
        leftClicks: 0
    }));

    const groupedData = normalizedData.reduce((acc, curr) => {
        const closestSlot = timelineData.reduce((closest, slot) => {
            const currentDiff = Math.abs(new Date(curr.snapshot_time).getTime() - slot.snapshot_time);
            const closestDiff = Math.abs(new Date(curr.snapshot_time).getTime() - closest.snapshot_time);
            return currentDiff < closestDiff ? slot : closest;
        }, timelineData[0]);

        if (!acc[closestSlot.snapshot_time]) {
            acc[closestSlot.snapshot_time] = {
                snapshot_time: closestSlot.snapshot_time,
                keyboard_presses: 0,
                totalMouseDistance: 0,
                rightClicks: 0,
                leftClicks: 0
            };
        }

        acc[closestSlot.snapshot_time].keyboard_presses += curr.keyboard_presses;
        acc[closestSlot.snapshot_time].totalMouseDistance += curr.totalMouseDistance;
        acc[closestSlot.snapshot_time].rightClicks += curr.rightClicks;
        acc[closestSlot.snapshot_time].leftClicks += curr.leftClicks;

        return acc;
    }, {} as Record<number, NormalizedInputData>);
    console.log('Grouped data:', groupedData);


    const mergedData = timelineData.map(timePoint => 
        groupedData[timePoint.snapshot_time] || timePoint
    );


    console.log('Timeline points:', timelineData.length);
    console.log('Normalized data points:', normalizedData.length);
    console.log('Sample normalized data:', normalizedData[0]);
    console.log(mergedData)
    console.log(new Date(normalizedData[0].snapshot_time).getTime());

    return (
        <ChartContainer config={chartConfig} className="max-h-[250px] w-full [&_.recharts-text]:fill-theme-foreground-secondary">
            <LineChart
                accessibilityLayer
                data={mergedData}
                margin={{
                    left: 12,
                    right: 12,
                }}
            >
                <CartesianGrid
                    strokeDasharray="2 2"
                    vertical={false}
                    className="stroke-theme-foreground-secondary/40"
                />
                <XAxis
                    dataKey={"snapshot_time"}
                    tickLine={false}
                    axisLine={false}
                    interval={5}
                    className="[&_.recharts-cartesian-axis-tick-value]:!fill-theme-foreground/80"
                    tickMargin={8}
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="[&_.recharts-cartesian-axis-tick-value]:!fill-theme-foreground/80"
                    allowDecimals={false}
                />
                <ChartTooltip 
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Line
                    dataKey="totalMouseDistance"
                    type="monotone"
                    stroke="#74c7ec"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    dataKey="rightClicks"
                    type="monotone"
                    stroke="#f9e2af"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    dataKey="leftClicks"
                    type="monotone"
                    stroke="#cba6f7"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    dataKey="keyboard_presses"
                    type="monotone"
                    stroke="#a6e3a1"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ChartContainer>
    )
}
