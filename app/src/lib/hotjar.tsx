"use client";
    import Script from "next/script";
 
const HotJar = () => {
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID;
  
    if (process.env.NODE_ENV === "production" && hotjarId) {
    return (
      <Script id="hotjar">
        {`
          (function (h, o, t, j, a, r) {
            h.hj =
              h.hj ||
              function () {
                // eslint-disable-next-line prefer-rest-params
                (h.hj.q = h.hj.q || []).push(arguments);
              };
            h._hjSettings = { hjid: ${JSON.stringify(hotjarId)}, hjsv: 6 };
            a = o.getElementsByTagName("head")[0];
            r = o.createElement("script");
            r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
          })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
        `}
      </Script>
    );
  }
  return null;
};
 
export { HotJar };
