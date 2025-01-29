import type { DatabaseQueryResponse } from "cloudflare/resources/d1/database.mjs"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ActivityTrack, ActivityTrackDatabaseRow, NormalizedInputData } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseActivityTrack(data: DatabaseQueryResponse) {
  return data.flatMap(item => 
    (item["results"] as Array<ActivityTrackDatabaseRow>)?.map((result) => ({
      ...result,
      mouse_activity: JSON.parse(result.mouse_activity),
      window_activity: JSON.parse(result.window_activity)
    }))
  ) as ActivityTrack[]
}

export function computeTotalActivityTrack(data: ActivityTrack[]): ActivityTrack {
  return data.reduce((acc, curr) => ({
    id: 0,
    snapshot_time: 0,
    mouse_activity: {
      totalMouseDistance: acc.mouse_activity.totalMouseDistance + curr.mouse_activity.totalMouseDistance,
      rightClicks: acc.mouse_activity.rightClicks + curr.mouse_activity.rightClicks,
      leftClicks: acc.mouse_activity.leftClicks + curr.mouse_activity.leftClicks
    },
    keyboard_presses: acc.keyboard_presses + curr.keyboard_presses,
    window_activity: acc.window_activity.concat(curr.window_activity)
  }))
}

export function normalizeInputData(data: ActivityTrack[]): Array<NormalizedInputData> {
  console.log("before normalization", data)
  return data.map(item => ({
    snapshot_time: item.snapshot_time * 1000,
    keyboard_presses: item.keyboard_presses / 2,
    totalMouseDistance: item.mouse_activity.totalMouseDistance / 10,
    rightClicks: item.mouse_activity.rightClicks,
    leftClicks: item.mouse_activity.leftClicks
  }))
}