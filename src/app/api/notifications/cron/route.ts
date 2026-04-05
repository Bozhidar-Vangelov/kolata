import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PushSubscription } from "web-push";

const EXPIRABLE_TABLES = [
  { table: "insurance", type: "insurance" },
  { table: "kasko", type: "kasko" },
  { table: "technical_inspection", type: "inspection" },
  { table: "vignette", type: "vignette" },
] as const;

const PUSH_DAY_THRESHOLDS = [10, 5, 1] as const;
const EMAIL_DAY_THRESHOLD = 14;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date();
  let pushCount = 0;
  let emailCount = 0;

  for (const { table, type } of EXPIRABLE_TABLES) {
    // Check each threshold
    for (const days of [...PUSH_DAY_THRESHOLDS, EMAIL_DAY_THRESHOLD]) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const dateStr = targetDate.toISOString().split("T")[0];

      // Find records expiring on this date
      const { data: records } = await supabase
        .from(table)
        .select("id, car_id")
        .eq("end_date", dateStr);

      if (!records || records.length === 0) continue;

      for (const record of records) {
        // Get car owner
        const { data: car } = await supabase
          .from("cars")
          .select("user_id")
          .eq("id", record.car_id)
          .single();

        if (!car) continue;

        // Check notification preferences on the record
        const notifyField =
          days === 10
            ? "notify_10_days"
            : days === 5
              ? "notify_5_days"
              : days === 1
                ? "notify_1_day"
                : null;

        if (notifyField) {
          const { data: fullRecord } = await supabase
            .from(table)
            .select(notifyField)
            .eq("id", record.id)
            .single();

          if (
            fullRecord &&
            typeof fullRecord === "object" &&
            notifyField in fullRecord &&
            !(fullRecord as Record<string, unknown>)[notifyField]
          ) {
            continue;
          }
        }

        const channel = days === EMAIL_DAY_THRESHOLD ? "email" : "push";

        // Check if already sent
        const { data: existing } = await supabase
          .from("notification_log")
          .select("id")
          .eq("record_type", type)
          .eq("record_id", record.id)
          .eq("days_before", days)
          .eq("channel", channel)
          .limit(1)
          .single();

        if (existing) continue;

        // Get user profile for push subscription or email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, push_subscription")
          .eq("id", car.user_id)
          .single();

        if (!profile) continue;

        if (channel === "push" && profile.push_subscription) {
          // Send push notification
          try {
            const webpush = await import("web-push");
            webpush.setVapidDetails(
              "mailto:noreply@kolata.app",
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
              process.env.VAPID_PRIVATE_KEY!
            );

            await webpush.sendNotification(
              profile.push_subscription as unknown as PushSubscription,
              JSON.stringify({
                title: "Kolata",
                body: `Your ${type} expires in ${days} day${days > 1 ? "s" : ""}!`,
                url: "/bg/dashboard",
              })
            );
            pushCount++;
          } catch {
            // Push failed - subscription might be expired
          }
        }

        if (channel === "email" && process.env.RESEND_API_KEY) {
          try {
            const { Resend } = await import("resend");
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: "Kolata <onboarding@resend.dev>",
              to: profile.email,
              subject: `Reminder: Your ${type} expires in ${days} days`,
              text: `Your ${type} expires in ${days} days. Please log in to Kolata to review and renew it.`,
            });
            emailCount++;
          } catch {
            // Email failed
          }
        }

        // Log notification
        await supabase.from("notification_log").insert({
          user_id: car.user_id,
          record_type: type,
          record_id: record.id,
          days_before: days,
          channel,
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    pushCount,
    emailCount,
  });
}
