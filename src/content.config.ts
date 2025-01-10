import { defineCollection, z } from "astro:content";

const experience = defineCollection({
    schema: z.object({
        title: z.string(),
        shortDescription: z.string(),
        heroImage: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        company: z.string(),
        position: z.string(),
    })
})

export const collections = { experience };