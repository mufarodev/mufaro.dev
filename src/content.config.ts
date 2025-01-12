import { defineCollection, getCollection, z } from "astro:content";

const experienceSchema = z.object({
    title: z.string(),
    shortDescription: z.string(),
    url: z.string().default(""),
    flag: z.string().default(""),
    flagColor: z.string().default(""),
    heroImage: z.string(),
    startDate: z.string(),
    endDate: z.string().default(""),
    company: z.string(),
    position: z.string(),
});


type Collections = Awaited<ReturnType<typeof getCollection>>
type Experience = Extract<Collections[number], { collection: "experience" }>

const experience = defineCollection({
    schema: experienceSchema
});

export type { Experience };
export const collections = { experience};