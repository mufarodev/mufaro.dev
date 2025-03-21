import type { Experience } from "../content.config";
import { cn } from "../util";
import { motion } from "framer-motion";

interface ExperienceListProps {
  experiences: Experience[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    },
  },
}

const card = {
  hidden: { opacity: 0, transform: "translateY(10px)" },
  show: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: {
      duration: 0.3,
      type: "spring",
      stiffness: 200,
      mass: 0.5,
      damping: 10,
    },
  },
}

export function ExperienceList({ experiences }: ExperienceListProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6"
    >
      {experiences.map((experience) => {
        const data = experience.data;

        return (
          <motion.div
            variants={card}
            className={cn(
              "relative backdrop-blur-xl bg-white/30 dark:bg-black/25 border border-black/10 dark:border-white/10 rounded-2xl shadow-xl",
              data.url ? "hover:border-black/20 dark:hover:border-white/20 hover:bg-white/40 dark:hover:bg-black/30 transition-all duration-300 cursor-pointer" : ""
            )}
            key={experience.slug}
            onClick={() => {
              if (data.url) {
                window.open(data.url);
              }
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 mix-blend-overlay pointer-events-none opacity-50"
            >
            </div>

            <div
              className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none"
              style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMSAwIDAgMCAwIDEgMCAwIDAgMCAxIDAgMCAwIDAuNSAwIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')" }}
            >
            </div>

            <div
              className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/20 to-transparent"
            >
            </div>

            <div className="p-6 flex justify-between relative">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <h3 className="text-lg font-bold text-theme-foreground dark:text-white">
                    {data.company} - <span>{data.position}</span>
                  </h3>

                </div>

                {data.url && (
                  <p className="text-sm text-theme-foreground-secondary dark:text-white/75">{data.url}</p>
                )}

                <p className="text-theme-foreground dark:text-white opacity-95">
                  {data.shortDescription}
                </p>

                <div className="flex gap-2 items-center">
                  <p className="text-sm text-theme-foreground-secondary dark:text-white/50">
                    {data.startDate} {data.endDate ? ` - ${data.endDate}` : ""}
                  </p>

                  {data.flag &&
                    <span
                      className={cn(`px-2 py-[1px] rounded-full uppercase font-semibold text-xs text-theme-foreground/70 dark:text-white/70 w-fit bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20`)}
                    >
                      {data.flag}
                    </span>
                  }
                </div>
              </div>

              <img
                src={data.heroImage}
                alt=""
                className="object-fit w-20 h-20 rounded-lg"
              />
            </div>

            <div className="element-glow absolute inset-0 rounded-lg mask-border pointer-events-none"></div>
          </motion.div>
        );
      })}
      <div className="h-32"></div>
    </motion.div>
  );
}