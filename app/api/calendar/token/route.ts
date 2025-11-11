import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    // Allow user ID from header for server-side tool calls
    const actualUserId = userId || request.headers.get("x-user-id");

    if (!actualUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Google OAuth token from Clerk
    const client = await clerkClient();
    const provider = "oauth_google";

    try {
      const tokenResponse = await client.users.getUserOauthAccessToken(
        actualUserId,
        provider
      );

      if (tokenResponse.data && tokenResponse.data.length > 0) {
        const token = tokenResponse.data[0].token;

        return NextResponse.json({
          accessToken: token,
          hasAccess: true,
        });
      }

      return NextResponse.json(
        {
          hasAccess: false,
          message:
            "No Google Calendar access. Please sign out and sign in with Google to grant Calendar permissions.",
        },
        { status: 403 }
      );
    } catch (error) {
      console.error("Error fetching OAuth token:", error);
      return NextResponse.json(
        {
          hasAccess: false,
          message:
            "Failed to get Google Calendar access. You may need to sign out and sign in with Google again to grant Calendar permissions.",
        },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Calendar token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
