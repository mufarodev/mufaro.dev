export type MouseActivity = {
    totalMouseDistance: number;
    rightClicks: number;
    leftClicks: number;
}

export type WindowActivity = {
    activity: string;
    time: number;
}

export type ActivityTrack = {
    id: number;
    snapshot_time: number;
    mouse_activity: MouseActivity;
    keyboard_presses: number;
    window_activity: WindowActivity[];
}

export type NormalizedInputData = Pick<ActivityTrack, "snapshot_time" | "keyboard_presses"> & ActivityTrack["mouse_activity"]

export type ActivityTrackDatabaseRow = {
    id: number;
    snapshot_time: number;
    mouse_activity: string;
    keyboard_presses: number;
    window_activity: string;
}