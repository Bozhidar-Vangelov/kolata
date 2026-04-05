import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PushSubscription } from "web-push";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("push_subscription")
    .eq("id", user.id)
    .single();

  if (!profile?.push_subscription) {
    return NextResponse.json({ error: "No push subscription found" }, { status: 400 });
  }

  try {
    const webpush = await import("web-push");
    webpush.setVapidDetails(
      "mailto:noreply@kolata.app",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );

    await webpush.sendNotification(
      profile.push_subscription as unknown as PushSubscription,
      JSON.stringify({
        title: "Kolata - Test",
        body: "Push notifications are working!",
        url: "/",
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Push failed" },
      { status: 500 },
    );
  }
}
