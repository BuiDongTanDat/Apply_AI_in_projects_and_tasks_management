"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";

import { ImagePlus } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  image: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Please upload an image")
    .refine((file) => file.size <= 1_000_000, "Image must be smaller than 1MB")
    .refine(
      (file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
      "Invalid image type"
    ),
});

export const ImageUploader: React.FC = () => {
  const [preview, setPreview] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      image: new File([""], "placeholder"),
    },
  });

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      form.setValue("image", file, { shouldValidate: true });
      form.clearErrors("image");
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      multiple: false,
      maxFiles: 1,
      maxSize: 1_000_000,
      accept: {
        "image/png": [],
        "image/jpeg": [],
        "image/jpg": [],
      },
    });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Uploaded file:", values.image);
    alert(`Uploaded file: ${values.image.name}`);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-lg space-y-6"
      >
        {/* Upload Field */}
        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xl font-semibold">
                Upload your image
              </FormLabel>

              <FormControl>
                <div
                  {...getRootProps()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg border border-muted-foreground/50 p-6 text-center shadow-sm transition hover:bg-muted/30"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-[250px] rounded-md shadow"
                    />
                  ) : (
                    <ImagePlus className="size-28 text-muted-foreground" />
                  )}

                  <Input {...getInputProps()} type="file" className="hidden" />

                  {isDragActive ? (
                    <p className="text-sm text-muted-foreground">
                      Drop the image here...
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click or drag an image to upload
                    </p>
                  )}
                </div>
              </FormControl>

              {/* Dropzone errors */}
              {fileRejections.length > 0 && (
                <p className="text-sm text-destructive">
                  Image must be PNG/JPG and smaller than 1MB
                </p>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button
          type="submit"
          className="w-full rounded-lg py-3 text-lg"
          disabled={form.formState.isSubmitting}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};
