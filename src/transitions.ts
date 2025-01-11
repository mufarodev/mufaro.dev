const anim = {
  old: {
    name: "bump",
    duration: "0.5s",
    easing: "ease-in",
    direction: "reverse",
  },
  new: {
    name: "bump",
    duration: "0.5s",
    easing: "ease-in-out",
  },
};

export const bumpTransition = {
  forwards: anim,
  backwards: anim,
};
