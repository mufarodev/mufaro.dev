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
    },
  },
}

const card = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
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
  console.log(experiences)

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 px-6 overflow-y-auto"
    >
      {experiences.map((experience) => {
        const data = experience.data;

        return (
          <motion.div
            variants={card}
            className={cn(
              "text-white flex justify-between border-l-[2px] py-1 border-theme-foreground-contrast/50",
              data.url
                ? "group hover:border-theme-foreground-contrast hover:bg-theme-foreground-contrast/10 cursor-pointer"
                : null
            )}
            key={experience.slug}
            onClick={() => {
              if (data.url) {
                window.open(data.url);
              }
            }}
          >
            <div className="ml-2 geist-mono flex flex-col gap-[2px] justify-between">
              <div className="flex gap-2 items-center">
                <h2 className="text-[0.95rem]">
                  {data.company} - <span>{data.position}</span>
                </h2>
                {data.flag ? (
                  <span
                    className={cn(`px-2 rounded-sm uppercase font-semibold text-xs text-black`, data.flagColor ? null : "bg-theme-foreground-secondary")}
                    style={data.flagColor ? { backgroundColor: `#${data.flagColor}` } : {}}
                  >
                    {data.flag}
                  </span>
                ) : null}
              </div>
              {data.url ? (
                <p className="text-xs text-white opacity-75">{data.url}</p>
              ) : null}
              <p className="text-[0.9rem] text-white opacity-95">
                {data.shortDescription}
              </p>
              <p className="text-[0.7rem] text-white opacity-50">
                {data.startDate} {data.endDate ? ` - ${data.endDate}` : ""}
              </p>
            </div>
            <img
              src={data.heroImage}
              alt=""
              className="object-fit w-16 h-16 rounded-lg mr-2 mt-1"
            />
          </motion.div>
        );
      })}
      {/* blank space */}
      <div className="h-32"></div>
    </motion.div>
  );
}
