"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateEvent } from "@/lib/actions/events";
import { uploadImage, uploadMultipleImages } from "@/lib/actions/uploads";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const eventEditSchema = z
  .object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(5000),
    event_type: z.enum(["online", "offline"]),
    category: z.string().min(1),
    city: z.string().optional(),
    venue: z.string().optional(),
    landmark: z.string().optional(),
    start_date: z.date(),
    start_time: z.string().min(1),
    end_date: z.date(),
    end_time: z.string().min(1),
    main_image: z
      .custom<File | undefined>()
      .refine((file) => !file || file instanceof File, "Invalid file")
      .refine((file) => !file || file.size <= MAX_FILE_SIZE, "Image must be less than 5MB")
      .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Only JPEG, PNG, WebP, and GIF are allowed")
      .optional(),
    gallery_images: z.array(z.custom<File>()).max(4).optional(),
  })
  .refine(
    (data) => {
      const start = new Date(`${format(data.start_date, "yyyy-MM-dd")}T${data.start_time}`);
      const end = new Date(`${format(data.end_date, "yyyy-MM-dd")}T${data.end_time}`);
      return end > start;
    },
    {
      message: "End date/time must be after start date/time",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      if (data.event_type === "offline") {
        return Boolean(data.city && data.venue);
      }
      return true;
    },
    {
      message: "City and venue are required for offline events",
      path: ["venue"],
    }
  );

type EventEditValues = z.infer<typeof eventEditSchema>;

interface EventEditFormProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    event_type: "online" | "offline";
    category: string | null;
    city: string | null;
    venue: string | null;
    landmark: string | null;
    start_date: string;
    end_date: string;
    main_image_url: string;
    photos: string[] | null;
  };
}

export function EventEditForm({ event }: EventEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(event.main_image_url);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(event.photos || []);

  const startDate = useMemo(() => new Date(event.start_date), [event.start_date]);
  const endDate = useMemo(() => new Date(event.end_date), [event.end_date]);

  const form = useForm<EventEditValues>({
    resolver: zodResolver(eventEditSchema),
    defaultValues: {
      title: event.title,
      description: event.description || "",
      event_type: event.event_type,
      category: event.category || "Other",
      city: event.city || "",
      venue: event.venue || "",
      landmark: event.landmark || "",
      start_date: startDate,
      start_time: format(startDate, "HH:mm"),
      end_date: endDate,
      end_time: format(endDate, "HH:mm"),
      gallery_images: [],
    },
  });

  const eventType = form.watch("event_type");

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    form.setValue("main_image", file, { shouldDirty: true, shouldTouch: true, shouldValidate: true });

    const reader = new FileReader();
    reader.onloadend = () => setMainImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 4) {
      toast.error("Maximum 4 gallery images allowed");
      return;
    }

    form.setValue("gallery_images", files, { shouldDirty: true, shouldTouch: true, shouldValidate: true });

    const previews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setGalleryPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  async function onSubmit(data: EventEditValues) {
    setIsLoading(true);

    try {
      const userResponse = await fetch("/api/auth/user");
      const userData = await userResponse.json();
      const userId = userData.user?.id;

      if (!userId) {
        toast.error("Authentication error. Please sign in again.");
        setIsLoading(false);
        return;
      }

      let mainImageUrl = event.main_image_url;
      if (data.main_image) {
        const mainImageResult = await uploadImage(data.main_image, "event-images", userId);
        if (mainImageResult.error || !mainImageResult.data) {
          toast.error(mainImageResult.error || "Failed to upload main image");
          setIsLoading(false);
          return;
        }
        mainImageUrl = mainImageResult.data.url;
      }

      let galleryUrls = event.photos || [];
      if (data.gallery_images && data.gallery_images.length > 0) {
        const galleryResult = await uploadMultipleImages(data.gallery_images, "event-images", userId, 4);
        if (galleryResult.error) {
          toast.error(galleryResult.error);
          setIsLoading(false);
          return;
        }
        galleryUrls = galleryResult.data || [];
      }

      const startDateTime = new Date(`${format(data.start_date, "yyyy-MM-dd")}T${data.start_time}`);
      const endDateTime = new Date(`${format(data.end_date, "yyyy-MM-dd")}T${data.end_time}`);

      const result = await updateEvent(event.id, {
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        category: data.category,
        city: data.city || null,
        venue: data.venue || null,
        landmark: data.landmark || null,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        main_image_url: mainImageUrl,
        photos: galleryUrls,
      });

      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success("Event updated successfully");
      router.push(`/events/${event.id}`);
      router.refresh();
    } catch (error) {
      console.error("Update event error:", error);
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl">
          <CardHeader>
            <CardTitle>Edit Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-40" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {eventType === "offline" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="landmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Landmark</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) => field.onChange(new Date(`${e.target.value}T00:00:00`))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) => field.onChange(new Date(`${e.target.value}T00:00:00`))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl">
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="main_image"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Main Event Image (optional replacement)</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Input type="file" accept="image/*" onChange={handleMainImageChange} {...field} />
                      {mainImagePreview && (
                        <div className="relative h-48 w-full overflow-hidden rounded-lg border">
                          <img src={mainImagePreview} alt="Main preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Keep empty to retain current main image</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gallery_images"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Gallery Images (optional replacement)</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Input type="file" accept="image/*" multiple onChange={handleGalleryImagesChange} {...field} />
                      {galleryPreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {galleryPreviews.map((preview, idx) => (
                            <div key={idx} className="relative h-24 overflow-hidden rounded-lg border">
                              <img src={preview} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Upload 1-4 images to replace existing gallery</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1 rounded-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
