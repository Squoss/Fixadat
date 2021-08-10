// https://www.carlrippon.com/fetch-with-async-await-and-typescript/

interface HttpResponse<T> extends Response {
  parsedBody?: T;
}
export async function fetchJson<T>(request: Request): Promise<HttpResponse<T>> {
  // https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#xmlhttprequest-native-javascript
  if (!/^(GET|HEAD|OPTIONS)$/.test(request.method)) {
    const csrf_token = document.querySelector("meta[name='csrf-token']")!.getAttribute("content");
    request.headers.append("Csrf-Token", csrf_token!);
  }

  const response: HttpResponse<T> = await fetch(request);
  try {
    response.parsedBody = await response.json();
  } catch (ex) { }

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response;
}

export async function get<T>(path: string, accessToken: string, args: RequestInit = { method: "get", mode: "same-origin", credentials: "same-origin", cache: "no-store", redirect: "error", headers: { "X-Access-Token": accessToken } }): Promise<HttpResponse<T>> {
  return await fetchJson<T>(new Request(path, args));
}

export async function patch<T>(
  path: string,
  accessToken: string,
  body: any,
  args: RequestInit = { method: "PATCH", body: JSON.stringify(body), mode: "same-origin", credentials: "same-origin", cache: "no-store", redirect: "error", headers: { "Content-Type": "application/json", "X-Access-Token": accessToken } },
): Promise<HttpResponse<T>> {
  return await fetchJson<T>(new Request(path, args));
}

export async function post<T>(
  path: string,
  accessToken="",
  body={},
  args: RequestInit = { method: "POST", body: JSON.stringify(body), mode: "same-origin", credentials: "same-origin", cache: "no-store", redirect: "error", headers: { "Content-Type": "application/json", "X-Access-Token": accessToken } },
): Promise<HttpResponse<T>> {
  return await fetchJson<T>(new Request(path, args));
}

export async function put<T>(
  path: string,
  accessToken: string,
  body: any,
  args: RequestInit = { method: "PUT", body: JSON.stringify(body), mode: "same-origin", credentials: "same-origin", cache: "no-store", redirect: "error", headers: { "Content-Type": "application/json", "X-Access-Token": accessToken } },
): Promise<HttpResponse<T>> {
  return await fetchJson<T>(new Request(path, args));
}

export default fetchJson;
