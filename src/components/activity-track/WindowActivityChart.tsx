import { Cell, Label, LabelList, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, Sector, type PieLabel } from "recharts"
import type { WindowActivity } from "../../types"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/charts"
import type { JSX } from "astro/jsx-runtime"

type WindowActivityChartProps = {
    data: Array<WindowActivity>
}

const chartConfig = {
    activity: {
        label: "Activity",
    },
    gaming: {
        label: "Gaming",
    },
    Coding: {
        label: "Coding",
    },
    Youtube: {
        label: "YouTube",
    },
    Social: {
        label: "Social Media",
    },
    Discord: {
        label: "Discord",
    },
    Other: {
        label: "Other",
    }
} satisfies ChartConfig

// couldnt find the type from the lib lmao
interface ActiveShapeProps {
    cx: number;
    cy: number;
    midAngle: number;
    outerRadius: number;
    fill: string;
    value: number;
}

function timeToPercentage(windowActivities: Array<WindowActivity>) {
    const total = windowActivities.reduce((acc, curr) => acc + curr.time, 0);
    return windowActivities.map(item => {
        const newTime = Math.round((item.time / total) * 100);
        
        return {
            ...item,
            time: newTime > 0 ? newTime : 1,
        }
    }).sort((a, b) => b.time - a.time);
}
    

const renderActiveShape = (props: ActiveShapeProps, label: string): JSX.Element => {
    if (props.value < 3) return <></>;

    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, outerRadius, fill } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 20;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} strokeWidth={2} className="stroke-theme-foreground-contrast" fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill}  className="stroke-theme-foreground-secondary" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} className="fill-theme-foreground/90 text-[10px]">{label}</text>
        </g>
    );
};

export function WindowActivityChart({ data }: WindowActivityChartProps) {
    const filteredData = data.filter(item => item.time > 0);
    const chartData = timeToPercentage(filteredData);

    console.log(chartData);

    return (<div className="flex items-center min-h-[350px]">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px] w-full pb-0 [&_.recharts-pie-label-text]:fill-text-foreground">
            <PieChart
            >
                <ChartTooltip 
                    content={<ChartTooltipContent hideLabel color="#9e89b8" />} 
                />
                <defs>
                    <pattern id="dashed-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
                        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4"
                            className="stroke-theme-foreground-contrast"
                            strokeWidth="1" />
                    </pattern>
                </defs>
                <Pie
                    data={chartData}
                    dataKey="time"
                    nameKey="activity"
                    startAngle={-270}
                    endAngle={90}
                    label={(props) => renderActiveShape(props, chartConfig[props.name as keyof typeof chartConfig].label)}
                    innerRadius={40}
                    outerRadius={80}>
                    {Object.keys(chartConfig).map((key) => (
                        <Cell
                            key={key}
                            fill="url(#dashed-pattern)"
                            className="!stroke-[2px] !stroke-theme-foreground-contrast"
                        />
                    ))}
                    <LabelList
                        dataKey="time"
                        stroke="none"
                        fontSize="0.7rem"
                        className="font-bold geist-mono fill-text-foreground"
                        formatter={(value: number) => value >= 3 ? `${value}%` : null}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px] w-full pb-0"
        >
            <RadarChart data={chartData}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <PolarAngleAxis 
                    stroke="rgb(222 210 232 / 0.9)"
                    tickLine={false}
                    textRendering={"geometricPrecision"}
                    dataKey={"activity"} 
                />
                <PolarGrid className="stroke-theme-foreground fill-theme-foreground/5" />
                <Radar
                    dataKey="time"
                    fill="#9e89b8"
                    fillOpacity={0.6}
                    dot={{
                        r: 4,
                        fillOpacity: 1
                    }}
                ></Radar>
            </RadarChart>
        </ChartContainer>
        </div>
    )
} 