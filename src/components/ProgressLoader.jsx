import React, { useEffect, useMemo } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useSelector } from "react-redux";
import Lottie from "react-lottie-player";
import amazingLoading from "assets/lottie/amazing-loading-for-ud.json";

const ProgressLoader = React.memo(() => {
  
  const theme = useSelector((state) => state.darkLightMode.theme);
  const memoizedTheme = useMemo(() => theme, [theme]);

  useEffect(() => {
    NProgress.configure({ showSpinner: false, minimum: 0.1 });
    NProgress.start();

    return () => {
      NProgress.done();
    };
  }, []);

  useEffect(() => {
    if (memoizedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [memoizedTheme]);

  return (
    <div className="w-full h-dvh flex items-center justify-center bg-white dark:bg-slate-900">
      <Lottie loop play animationData={amazingLoading} style={{ width: 500, height: 500 }} />
    </div>
  );
});

export default ProgressLoader;