import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  vus: 1, // Virtual users
//   duration: "2s", will run as much as it can for two seconds.
  iterations: 3, //only runs three times
};

export default function () {
  const baseUrl = "https://ohbnvpessbejlvggzthb.supabase.co";

  const loginPayload = JSON.stringify({
    email: "job@test.com",
    password: "123",
  });

  const headers = {
    "Content-Type": "application/json",
    apikey: __ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  //Login
  const loginRes = http.post(
    `${baseUrl}/auth/v1/token?grant_type=password`,
    loginPayload,
    { headers }
  );

  const loginSuccess = check(loginRes, {
    "login status is 200": (r) => r.status === 200,
    "access_token exists": (r) => JSON.parse(r.body).access_token !== undefined,
  });

  if (!loginSuccess) {
    console.error("Login failed");
    return;
  }

  const token = JSON.parse(loginRes.body).access_token;

  const authHeaders = {
    ...headers,
    Authorization: `Bearer ${token}`,
  };

  //Fetch lessons
  const fetchRes = http.get(`${baseUrl}/rest/v1/lessons`, {
    headers: authHeaders,
  });

  check(fetchRes, {
    "fetch status is 200": (r) => r.status === 200,
  });

  //Logout
  const logoutRes = http.post(`${baseUrl}/auth/v1/logout`, null, {
    headers: authHeaders,
  });

  check(logoutRes, {
    "logout status is 204": (r) => r.status === 204,
  });

  sleep(1); // pause
}
