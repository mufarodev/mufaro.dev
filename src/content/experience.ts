import { getCollection } from "astro:content";

export async function getExperience() {
    const experience = getCollection("experience");

    return experience;
}