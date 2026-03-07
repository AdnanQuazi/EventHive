"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ImageIcon, Loader2, Users } from "lucide-react";

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
import { toast } from "sonner";
import { createClub } from "@/lib/actions/clubs";
import { uploadImage } from "@/lib/actions/uploads";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const clubFormSchema = z.object({
  name: z
    .string()
    .min(2, "Club name must be at least 2 characters")
    .max(100, "Club name must not exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description must not exceed 200 characters"),
  city: z
    .string()
    .min(2, "City name must be at least 2 characters")
    .max(100, "City name must not exceed 100 characters")
    .optional(),
  image: z
    .custom<File>()
    .refine((file) => !file || file instanceof File, "Invalid file")
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "Image must be less than 5MB"
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only JPEG, PNG, WebP, and GIF images are allowed"
    )
    .optional(),
});

type ClubFormValues = z.infer<typeof clubFormSchema>;

export function ClubForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ClubFormValues>({
    resolver: zodResolver(clubFormSchema),
    defaultValues: {
      name: "",
      description: "",
      city: "",
    },
  });

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: ClubFormValues) {
    setIsLoading(true);

    try {
      // Get user ID
      const userResponse = await fetch("/api/auth/user");
      const userData = await userResponse.json();
      const userId = userData.user?.id;

      if (!userId) {
        toast.error("Authentication error. Please sign in again.");
        setIsLoading(false);
        return;
      }

      // Upload image if provided
      let imageUrl: string | null = null;
      if (data.image) {
        const imageResult = await uploadImage(
          data.image,
          "club-images",
          userId
        );

        if (imageResult.error || !imageResult.data) {
          toast.error(imageResult.error || "Failed to upload image");
          setIsLoading(false);
          return;
        }

        imageUrl = imageResult.data.url;
      }

      // Create club
      const result = await createClub({
        name: data.name,
        description: data.description,
        city: data.city || null,
        image_url: imageUrl,
      });

      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success("Club created successfully!");
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
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Club Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Club Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Tech Enthusiasts Club"
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
                      placeholder="Brief description of your club..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0} / 200 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., New York"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Location where your club is based
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Club Image (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        {...field}
                      />
                      {imagePreview && (
                        <div className="relative w-full h-48 rounded-md overflow-hidden border">
                          <img
                            src={imagePreview}
                            alt="Club preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload a logo or image for your club (max 5MB)
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
                Creating Club...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Create Club
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
