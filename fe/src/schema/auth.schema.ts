import * as z from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { message: "Password is required" }),
});

const registerSchema = z
  .object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }),
    email: z.email(),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export { loginSchema, registerSchema };
