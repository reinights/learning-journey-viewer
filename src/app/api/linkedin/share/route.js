import fs from "fs";
import path from "path";
import { cookies } from "next/headers";

//Each time the code changes, user needs to login
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("linkedin_token")?.value;
  if (!accessToken) return new Response("No token provided", { status: 401 });

  // Used to get userURN (to set author key)
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const profile = await profileRes.json();

  if (!profile.sub) {
    console.error("Failed to fetch profile", profile);
    return new Response("Failed to fetch profile", { status: 500 });
  }

  const userURN = `urn:li:person:${profile.sub}`;

  // Register image upload (returns two values we need: uploadUrl and asset)
  const registerRes = await fetch(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: userURN,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    }
  );

  const registerData = await registerRes.json();

  const uploadUrl =
    registerData.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ].uploadUrl;
  const asset = registerData.value.asset;

  // Image upload
  const imagePath = path.resolve("public/certificate.png");
  const imageBuffer = fs.readFileSync(imagePath); //needs raw binary image data

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "image/png",
    },
    body: imageBuffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    console.error("Upload failed:", errText);
    return new Response("Upload failed", { status: 500 });
  }

  // Create post
  const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0", //Needed: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/ugc-post-api?view=li-lms-2025-07&tabs=http#retrieve-ugc-posts
    },
    body: JSON.stringify({
      author: userURN,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: "I've just completed my learning journey on Cyber Security and Phishing basics at PlusMoon Digital \n\nFind out more:\nhttps://www.linkedin.com/company/taught-by-humans \n\n #AI #Learning #Cybersecurity",
            attributes: [
              {
                start: 81,
                length: 16,
                value: {
                  "com.linkedin.common.CompanyAttributedEntity": {
                    // Would need the actual urn and the names need to match.
                    company: "urn:li:organization:108116196",
                  },
                },
              },
            ],
          },
          shareMediaCategory: "IMAGE",
          //Not actually sure where this is used.
          media: [
            {
              status: "READY",
              description: { text: "Completed at Taught by Humans" },
              media: asset,
              title: { text: "Cyber Security and Phishing Certificate" },
            },
          ],
        },
      },
      //Can change to PUBLIC / CONNECTIONS
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "CONNECTIONS",
      },
    }),
  });

  if (!postRes.ok) {
    const err = await postRes.text();
    console.error("Post failed:", err);
    return new Response("Post failed", { status: 500 });
  }

  const postData = await postRes.json();
  
  // Extract the post ID from the response
  const postId = postData.id;
  
  // Convert ugcPost URN to activity URN for the URL
  // API returns: "urn:li:ugcPost:1234567890"
  // URL needs: "urn:li:activity:1234567890"
  const activityUrn = postId.replace('ugcPost', 'activity');
  
  // Construct the LinkedIn post URL
  const linkedinPostUrl = `https://www.linkedin.com/feed/update/${activityUrn}/`;
  
  // Redirect to the LinkedIn post
  return Response.redirect(linkedinPostUrl, 302);
}
