"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  CalendarIcon,
  CheckCircle2,
  ImageIcon,
  Loader2,
  MapPin,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { createEvent } from "@/lib/actions/events";
import { getManagedClubs } from "@/lib/actions/clubs";
import { generateEventMainImages } from "@/lib/actions/ai-images";
import { uploadImage, uploadMultipleImages } from "@/lib/actions/uploads";
import type { Club } from "@/lib/actions/clubs";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const eventFormSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must not exceed 100 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must not exceed 5000 characters"),
    event_type: z.enum(["online", "offline"], {
      required_error: "Please select an event type",
    }),
    category: z.string({
      required_error: "Please select a category",
    }),
    city: z.string().optional(),
    venue: z.string().optional(),
    landmark: z.string().optional(),
    start_date: z.date({ required_error: "Start date is required" }),
    start_time: z.string({ required_error: "Start time is required" }),
    end_date: z.date({ required_error: "End date is required" }),
    end_time: z.string({ required_error: "End time is required" }),
    club_id: z.string().optional(),
    main_image: z
      .custom<File>()
      .refine((file) => file instanceof File, "Main image is required")
      .refine(
        (file) => file.size <= MAX_FILE_SIZE,
        "Image must be less than 5MB"
      )
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Only JPEG, PNG, WebP, and GIF images are allowed"
      ),
    gallery_images: z
      .array(z.custom<File>())
      .max(4, "Maximum 4 gallery images allowed")
      .optional(),
  })
  .refine(
    (data) => {
      const start = new Date(
        `${format(data.start_date, "yyyy-MM-dd")}T${data.start_time}`
      );
      const end = new Date(
        `${format(data.end_date, "yyyy-MM-dd")}T${data.end_time}`
      );
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
        return data.city && data.venue;
      }
      return true;
    },
    {
      message: "City and venue are required for offline events",
      path: ["venue"],
    }
  );

type EventFormValues = z.infer<typeof eventFormSchema>;

type GeneratedMainImage = {
  id: string;
  dataUrl: string;
  prompt: string;
};

export function EventForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [mainImageSource, setMainImageSource] = useState<"manual" | "ai" | null>(null);
  const [mainImageMode, setMainImageMode] = useState<"manual" | "ai">("manual");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAiImages, setIsGeneratingAiImages] = useState(false);
  const [generatedMainImages, setGeneratedMainImages] = useState<GeneratedMainImage[]>([]);
  const [selectedGeneratedImageId, setSelectedGeneratedImageId] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      event_type: "offline",
      category: "",
      start_date: undefined,
      end_date: undefined,
      start_time: "",
      end_time: "",
      city: "",
      venue: "",
      landmark: "",
      club_id: "none",
      gallery_images: [],
    },
  });

  const eventType = form.watch("event_type");

  const dataUrlToFile = async (dataUrl: string, fileNamePrefix: string) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const extension = blob.type.split("/")[1] || "png";
    return new File([blob], `${fileNamePrefix}-${Date.now()}.${extension}`, {
      type: blob.type,
    });
  };

  const force16By9DataUrl = async (dataUrl: string) => {
    const image = new Image();

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to load generated image"));
      image.src = dataUrl;
    });

    const targetWidth = 1600;
    const targetHeight = 900;
    const targetRatio = targetWidth / targetHeight;
    const sourceRatio = image.width / image.height;

    let sx = 0;
    let sy = 0;
    let sw = image.width;
    let sh = image.height;

    if (sourceRatio > targetRatio) {
      sw = image.height * targetRatio;
      sx = (image.width - sw) / 2;
    } else if (sourceRatio < targetRatio) {
      sh = image.width / targetRatio;
      sy = (image.height - sh) / 2;
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to process generated image");
    }

    context.drawImage(image, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL("image/jpeg", 0.92);
  };

  const setMainImageFromDataUrl = async (dataUrl: string, source: "manual" | "ai") => {
    const normalizedDataUrl = source === "ai" ? await force16By9DataUrl(dataUrl) : dataUrl;
    const file = await dataUrlToFile(
      normalizedDataUrl,
      source === "ai" ? "generated-main-image" : "main-image"
    );
    form.setValue("main_image", file, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
    setMainImagePreview(normalizedDataUrl);
    setMainImageSource(source);
  };

  // Load user's clubs
  useEffect(() => {
    async function loadClubs() {
      const result = await getManagedClubs();
      if (result.data) {
        setClubs(result.data);
      }
      setLoadingClubs(false);
    }
    loadClubs();
  }, []);

  // Handle main image change
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("main_image", file, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
      setMainImageSource("manual");
      setSelectedGeneratedImageId(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateMainImages = async () => {
    const title = form.getValues("title")?.trim();
    const category = form.getValues("category")?.trim();
    const description = form.getValues("description")?.trim();

    const effectivePrompt =
      aiPrompt.trim() ||
      [title, category, description].filter(Boolean).join(" | ");

    if (!effectivePrompt) {
      toast.error("Add a prompt or fill title/category/description first");
      return;
    }

    setIsGeneratingAiImages(true);
    setMainImageMode("ai");

    try {
      const result = await generateEventMainImages({
        prompt: effectivePrompt,
        title,
        category,
        count: 4,
      });

      if (result.error || !result.data) {
        toast.error(result.error || "Failed to generate images");
        return;
      }

      const newlyGenerated = result.data.images.map((dataUrl, index) => ({
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        dataUrl,
        prompt: effectivePrompt,
      }));

      setGeneratedMainImages((prev) => [...newlyGenerated, ...prev].slice(0, 12));

      const first = newlyGenerated[0];
      if (first) {
        setSelectedGeneratedImageId(first.id);
        await setMainImageFromDataUrl(first.dataUrl, "ai");
      }

      toast.success("AI images generated. Pick your favorite one.");
    } catch (error) {
      console.error("Generate AI images error:", error);
      toast.error("Failed to generate AI images");
    } finally {
      setIsGeneratingAiImages(false);
    }
  };

  const handleSelectGeneratedMainImage = async (image: GeneratedMainImage) => {
    setSelectedGeneratedImageId(image.id);
    await setMainImageFromDataUrl(image.dataUrl, "ai");
  };

  // Handle gallery images change
  const handleGalleryImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 4) {
      toast.error("Maximum 4 gallery images allowed");
      return;
    }

    form.setValue("gallery_images", files);

    // Create previews
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

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    const currentImages = form.getValues("gallery_images") || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue("gallery_images", newImages);
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data: EventFormValues) {
    setIsLoading(true);

    try {
      // Get user ID from form context (we'll need to fetch this)
      const userResponse = await fetch("/api/auth/user");
      const userData = await userResponse.json();
      const userId = userData.user?.id;

      if (!userId) {
        toast.error("Authentication error. Please sign in again.");
        setIsLoading(false);
        return;
      }

      // Upload main image
      const mainImageResult = await uploadImage(
        data.main_image,
        "event-images",
        userId
      );

      if (mainImageResult.error || !mainImageResult.data) {
        toast.error(mainImageResult.error || "Failed to upload main image");
        setIsLoading(false);
        return;
      }

      // Upload gallery images (if any)
      let galleryUrls: string[] = [];
      if (data.gallery_images && data.gallery_images.length > 0) {
        const galleryResult = await uploadMultipleImages(
          data.gallery_images,
          "event-images",
          userId,
          4
        );

        if (galleryResult.error) {
          toast.error(galleryResult.error);
          setIsLoading(false);
          return;
        }

        galleryUrls = galleryResult.data || [];
      }

      // Combine date and time
      const startDateTime = new Date(
        `${format(data.start_date, "yyyy-MM-dd")}T${data.start_time}`
      );
      const endDateTime = new Date(
        `${format(data.end_date, "yyyy-MM-dd")}T${data.end_time}`
      );

      // Create event
      const result = await createEvent({
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        category: data.category,
        city: data.city || null,
        venue: data.venue || null,
        landmark: data.landmark || null,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        main_image_url: mainImageResult.data.url,
        photos: galleryUrls.length > 0 ? galleryUrls : null,
        club_id: data.club_id && data.club_id !== "none" ? data.club_id : null,
      });

      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success("Event created successfully!");
      router.push("/profile");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Tech Conference 2026"
                      {...field}
                    />
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
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your event in detail (supports Markdown)..."
                      className="min-h-40"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0} / 5000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="offline">Offline (In-person)</SelectItem>
                      <SelectItem value="online">Online (Virtual)</SelectItem>
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
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Food & Drink">Food & Drink</SelectItem>
                      <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Networking">Networking</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Community">Community</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="club_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Club (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingClubs}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a club or post as individual" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="none">None (Personal Event)</SelectItem>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Post this event under a club you manage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl">
          <CardHeader>
            <CardTitle>Date & Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time *</FormLabel>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time *</FormLabel>
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

        {/* Location (only for offline events) */}
        {eventType === "offline" && (
          <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., San Francisco" {...field} />
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
                    <FormLabel>Venue *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Convention Center Hall A"
                        {...field}
                      />
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
                    <FormLabel>Landmark (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Near Golden Gate Bridge"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Images */}
        <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="main_image"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Main Event Image *</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Tabs
                        value={mainImageMode}
                        onValueChange={(value) => setMainImageMode(value as "manual" | "ai")}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="manual">Upload manually</TabsTrigger>
                          <TabsTrigger value="ai">Generate with AI</TabsTrigger>
                        </TabsList>

                        <TabsContent value="manual" className="space-y-3">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleMainImageChange}
                            {...field}
                          />
                        </TabsContent>

                        <TabsContent value="ai" className="space-y-3">
                          <Textarea
                            placeholder="Describe the main event image you want, e.g. futuristic coding hackathon stage with neon lighting"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="min-h-24"
                          />

                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              onClick={handleGenerateMainImages}
                              disabled={isGeneratingAiImages}
                              className="rounded-full"
                            >
                              {isGeneratingAiImages ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-4 w-4" />
                                  Generate 4 images
                                </>
                              )}
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleGenerateMainImages}
                              disabled={isGeneratingAiImages || generatedMainImages.length === 0}
                              className="rounded-full"
                            >
                              Regenerate
                            </Button>
                          </div>

                          {generatedMainImages.length > 0 && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                              {generatedMainImages.map((generated) => {
                                const isSelected = selectedGeneratedImageId === generated.id;
                                return (
                                  <button
                                    key={generated.id}
                                    type="button"
                                    onClick={() => handleSelectGeneratedMainImage(generated)}
                                    className={cn(
                                      "relative aspect-video overflow-hidden rounded-xl border text-left transition",
                                      isSelected
                                        ? "border-accent ring-2 ring-accent/40"
                                        : "border-border hover:border-accent/60"
                                    )}
                                  >
                                    <img
                                      src={generated.dataUrl}
                                      alt="Generated event option"
                                      className="h-full w-full object-cover"
                                    />
                                    {isSelected && (
                                      <div className="absolute right-2 top-2 rounded-full bg-accent p-1 text-accent-foreground">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>

                      {mainImagePreview && (
                        <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                          <img
                            src={mainImagePreview}
                            alt="Main preview"
                            className="w-full h-full object-cover"
                          />
                          {mainImageSource && (
                            <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                              {mainImageSource === "ai" ? "AI selected" : "Uploaded"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload manually or generate with Gemini AI. Selected image is uploaded and stored exactly like manual uploads.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gallery_images"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Gallery Images (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                        {...field}
                      />
                      {galleryPreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {galleryPreviews.map((preview, index) => (
                            <div
                              key={index}
                              className="relative w-full h-32 rounded-md overflow-hidden border group"
                            >
                              <img
                                src={preview}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload up to 4 additional images (max 5MB each)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Event...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Publish Event
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            size="lg"
            className="rounded-full"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
