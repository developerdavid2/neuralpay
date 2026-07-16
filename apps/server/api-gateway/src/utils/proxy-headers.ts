export function forwardSetCookieHeaders(proxyRes: any, res: any) {
  const setCookie = proxyRes.headers["set-cookie"];
  if (setCookie) {
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    cookies.forEach((cookie: string) => {
      res.append("Set-Cookie", cookie);
    });
  }
}
