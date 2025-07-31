export async function GET() {
  const scope = "openid profile w_member_social";
    //openid profile is used to make URN using sub value.
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    process.env.LINKEDIN_REDIRECT_URI
  )}&scope=${scope}`;

  return Response.redirect(authUrl);
}
