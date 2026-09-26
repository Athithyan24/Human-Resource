import { useEffect, useState } from "react";
import { Lottie } from "lottie-react";

const cache = {};

export function SceneLottie({ src, className = "h-44 w-44" }) {
  const [data, setData] = useState(cache[src] || null);
  useEffect(() => {
    if (cache[src]) return setData(cache[src]);
    let live = true;
    fetch(src)
      .then((r) => r.json())
      .then((j) => {
        cache[src] = j;
        if (live) setData(j);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [src]);
  if (!data) return <div className={`${className} rounded-[24px] bg-mist/40 dark:bg-white/5`} />;
  return <Lottie animationData={data} loop className={className} />;
}
