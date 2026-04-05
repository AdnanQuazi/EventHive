"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import { generateQRCode } from "@/lib/utils/qrcode";
import { Calendar, MapPin, Download, CheckCircle2, Clock } from "lucide-react";

interface RegistrationQRCardProps {
  registration: {
    id: string;
    registration_token: string;
    checked_in: boolean;
    checked_in_at?: string;
    created_at: string;
    events: {
      id: string;
      title: string;
      start_date: string;
      venue?: string;
      city?: string;
      event_type?: string;
      main_image_url?: string;
    } | null;
  };
}

export function RegistrationQRCard({ registration }: RegistrationQRCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function generateQR() {
      try {
        const qrUrl = await generateQRCode(registration.registration_token);
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      } finally {
        setIsLoading(false);
      }
    }

    generateQR();
  }, [registration.registration_token]);

  if (!registration.events) {
    return null;
  }

  const event = registration.events;
  const eventDate = new Date(event.start_date);
  const isUpcoming = eventDate > new Date();

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${event.title.replace(/\s+/g, "-")}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        {event.main_image_url ? (
          <Image
            src={event.main_image_url}
            alt={event.title}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-purple-500 to-pink-500" />
        )}
        {registration.checked_in && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-500 text-white">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Checked In
            </Badge>
          </div>
        )}
        {!registration.checked_in && isUpcoming && (
          <div className="absolute top-4 right-4">
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              Pending
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-xl">{event.title}</CardTitle>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {eventDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              at{" "}
              {eventDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              {event.event_type === "online" 
                ? "Online Event" 
                : `${event.venue || "Venue"}${event.city ? `, ${event.city}` : ""}`
              }
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!registration.checked_in && isUpcoming && (
          <>
            <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6">
              {isLoading ? (
                <div className="h-50 w-50 animate-pulse rounded-lg bg-muted" />
              ) : qrCodeUrl ? (
                <>
                  <div className="rounded-lg border-4 border-white p-2 shadow-lg">
                    <Image
                      src={qrCodeUrl}
                      alt="Registration QR Code"
                      width={200}
                      height={200}
                      className="rounded"
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Show this QR code at the event entrance
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Failed to generate QR code
                </p>
              )}
            </div>

            {qrCodeUrl && (
              <Button
                onClick={downloadQRCode}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            )}
          </>
        )}

        {registration.checked_in && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-medium">Checked In Successfully</p>
                {registration.checked_in_at && (
                  <p className="text-xs text-green-600 dark:text-green-500">
                    {new Date(registration.checked_in_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!isUpcoming && !registration.checked_in && (
          <div className="rounded-lg border bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              This event has already passed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
