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
  if (data.length === 0) return {
    id: 0,
    snapshot_time: 0,
    mouse_activity: {
      totalMouseDistance: 0,
      rightClicks: 0,
      leftClicks: 0
    },
    keyboard_presses: 0,
    window_activity: []
  }

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

export function initGlowEffect() {
  // prevent dupe
  document.removeEventListener('mousemove', handleMouseMove);

  const card = document.getElementById('mainCard') as HTMLElement;
  if (!card) return;

  // cleanup
  const existingGlowContainers = card.querySelectorAll('.glow-container');
  existingGlowContainers.forEach(container => container.remove());
  const existingElementGlows = document.querySelectorAll('[id^="glow-element-"]');
  existingElementGlows.forEach(elem => elem.remove());

  const glowContainer = document.createElement('div');
  glowContainer.className = 'absolute inset-0 rounded-xl overflow-hidden pointer-events-none glow-container';
  glowContainer.style.zIndex = '-1';

  const glowElement = document.createElement('div');
  glowElement.id = 'glow';
  glowElement.className = 'absolute bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 opacity-0 blur-3xl';
  glowElement.style.width = '500px';
  glowElement.style.height = '500px';
  glowElement.style.borderRadius = '50%';
  glowElement.style.transform = 'translate(-50%, -50%)';
  glowElement.style.transition = 'opacity 150ms ease';

  // glowContainer.appendChild(glowElement); // thats the global one
  card.style.position = 'relative';
  card.appendChild(glowContainer);

  const glowElements = document.querySelectorAll('.element-glow') as NodeListOf<HTMLElement>;

  glowElements.forEach((element, index) => {
    const glowMaskElement = document.createElement('div');
    glowMaskElement.id = `glow-element-${index}`;
    glowMaskElement.className = 'absolute bg-gradient-to-r from-indigo-600/40 via-purple-600/40 to-indigo-600/40 opacity-0 blur-xl';
    glowMaskElement.style.width = '175px';
    glowMaskElement.style.height = '175px';
    glowMaskElement.style.borderRadius = '50%';
    glowMaskElement.style.transform = 'translate(-50%, -50%)';
    glowMaskElement.style.transition = 'opacity 150ms ease';
    glowMaskElement.style.zIndex = '1'; // dont touch i hate z-index

    element.appendChild(glowMaskElement);
  });

  function handleMouseMove(e: MouseEvent) {
    const card = document.getElementById('mainCard') as HTMLElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const isNearCard =
      e.clientX >= rect.left - 100 &&
      e.clientX <= rect.right + 100 &&
      e.clientY >= rect.top - 100 &&
      e.clientY <= rect.bottom + 100;

    const glowElement = document.getElementById('glow');
    if (glowElement && isNearCard) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      glowElement.style.opacity = '1';
      glowElement.style.left = `${x}px`;
      glowElement.style.top = `${y}px`;
    } else if (glowElement) {
      glowElement.style.opacity = '0';
    }

    // requery glows
    const glowElements = document.querySelectorAll('.element-glow') as NodeListOf<HTMLElement>;
    glowElements.forEach((element, index) => {
      const parentCard = element.closest('.backdrop-blur-md') as HTMLElement;
      if (!parentCard) return;

      const glowMaskElement = document.getElementById(`glow-element-${index}`);
      if (!glowMaskElement) return;

      const elementRect = parentCard.getBoundingClientRect();
      const isNearElement =
        e.clientX >= elementRect.left - 50 &&
        e.clientX <= elementRect.right + 50 &&
        e.clientY >= elementRect.top - 50 &&
        e.clientY <= elementRect.bottom + 50;

      if (isNearElement) {
        const x = e.clientX - elementRect.left;
        const y = e.clientY - elementRect.top;

        glowMaskElement.style.opacity = '1';
        glowMaskElement.style.left = `${x}px`;
        glowMaskElement.style.top = `${y}px`;
      } else {
        glowMaskElement.style.opacity = '0';
      }
    });
  }

  document.addEventListener('mousemove', handleMouseMove);
}


export function trimToLength(str: string, length: number): string {
  if (str.length > length) {
    return str.slice(0, length) + "...";
  }
  return str;
}

export function timestampToRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days > 1 ? `${days}d` : `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return hours > 1 ? `${hours}h` : `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return 'now';
  }
}

export function applyStoredTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}