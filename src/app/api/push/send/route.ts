import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@ssvm.edu.in";

    if (!vapidPublicKey || vapidPublicKey === "your-vapid-public-key-here" || !vapidPrivateKey || vapidPrivateKey === "your-vapid-private-key-here") {
      return NextResponse.json(
        { error: "VAPID keys not configured. Run: node scripts/generate-vapid-keys.js and add keys to .env" },
        { status: 500 }
      );
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const body = await request.json();
    const { title, message, url } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "title and message are required" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, sent: 0, failed: 0, message: "No subscribers" });
    }

    const payload = JSON.stringify({
      title,
      body: message,
      icon: "/assets/images/ssvm_final_logo-1774922153874.png",
      badge: "/assets/images/ssvm_final_logo-1774922153874.png",
      url: url || "/homepage",
    });

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
          sent++;
        } catch (err: unknown) {
          const pushError = err as { statusCode?: number };
          if (pushError.statusCode === 410 || pushError.statusCode === 404) {
            expiredEndpoints.push(sub.endpoint);
          }
          failed++;
        }
      })
    );

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
    }

    return NextResponse.json({ success: true, sent, failed, total: subscriptions.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
