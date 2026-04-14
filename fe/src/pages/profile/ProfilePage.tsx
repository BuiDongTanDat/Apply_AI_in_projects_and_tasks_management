import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { FileUpload } from "@/components/element/upload/FileUpload";
import { PositionSelector } from "@/components/element/selector/PositionSelector";
import { SkillInput } from "@/components/element/input/SkillInput";
import { Position } from "@/types/position.type";
import { userApi } from "@/api/user.api";
import { skillApi } from "@/api/skill.api";
import { InputNumber, Tooltip } from "antd";
import { FaQuestion } from "react-icons/fa";
import { useNavigate } from "react-router";
import {
  Crown,
  Shield,
  Zap,
  Clock,
  ArrowUpRight,
  CheckCircle,
} from "lucide-react";
import { billingApi } from "@/api/billing.api";
import type { Subscription, PlanFeatures } from "@/types/billing.type";
import { Button } from "@/components/element/button";
import { alert } from "@/provider/AlertService";

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  yearOfExperience: z.number().min(0, "Invalid years of experience").optional(),
  avatar: z.string().nullable(),
  position: z.enum(Position).optional().nullable(),
  skills: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Skill cannot be empty")
        .max(20, "Each skill must be 20 characters or fewer"),
    )
    .max(20, "You can add up to 20 skills"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

const PLAN_ICONS: Record<string, React.ReactNode> = {
  FREE: <Zap className="w-5 h-5" />,
  PRO: <Crown className="w-5 h-5" />,
  ENTERPRISE: <Shield className="w-5 h-5" />,
};

const FEATURE_LABELS: Record<string, string> = {
  aiAssistant: "AI Assistant",
  advancedAnalytics: "Advanced Analytics",
  prioritySupport: "Priority Support",
  customBranding: "Custom Branding",
  apiAccess: "API Access",
  exportReports: "Export Reports",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [avtImage, setAvtImage] = useState<string | null>(null);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();

  // Subscription state
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  const getProfileData = async () => {
    const data = await userApi.getProfile();
    console.log("Profile data:", data);
    form.reset({
      ...data,
      skills: data?.skills ?? [],
    });
  };

  useEffect(() => {
    getProfileData();
    skillApi
      .getAll()
      .then(setSkillSuggestions)
      .catch(() => setSkillSuggestions([]));
    billingApi
      .getSubscription()
      .then(setSubscription)
      .catch(() => {})
      .finally(() => setSubLoading(false));
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      yearOfExperience: 0,
      avatar: "",
      position: undefined,
      skills: [],
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    console.log("Submitting profile data:", data);
    try {
      setIsLoading(true);
      await userApi.updateProfile(data);
      alert("Profile updated successfully", "Success", "success");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 text-xs space-y-6">
      {/* Subscription / Plan Card */}
      {!subLoading && (
        <Card className="shadow-lg border border-slate-200 overflow-hidden">
          <div
            className="p-6"
            style={{
              background:
                subscription && subscription.status === "ACTIVE"
                  ? subscription.plan.name === "ENTERPRISE"
                    ? "linear-gradient(135deg, #fef3c7, #fde68a)"
                    : "linear-gradient(135deg, #eef2ff, #dbeafe)"
                  : "#f9fafb",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      subscription && subscription.status === "ACTIVE"
                        ? subscription.plan.name === "ENTERPRISE"
                          ? "#fbbf24"
                          : "#6366f1"
                        : "#e5e7eb",
                    color:
                      subscription && subscription.status === "ACTIVE"
                        ? "#fff"
                        : "#6b7280",
                  }}
                >
                  {subscription && subscription.status === "ACTIVE" ? (
                    PLAN_ICONS[subscription.plan.name]
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                    Current Plan
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {subscription && subscription.status === "ACTIVE"
                      ? subscription.plan.displayName
                      : "Free"}
                  </p>
                </div>
              </div>

              {subscription && subscription.status === "ACTIVE" ? (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    Expires {formatDate(subscription.endDate)}
                  </div>
                  <span className="text-[10px] font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {subscription.billingCycle}
                  </span>
                </div>
              ) : (
                <Button
                  onClick={() => navigate("/plans")}
                  className="cursor-pointer gap-1 bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:shadow-lg"
                  size="sm"
                >
                  Upgrade <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Features list for active plan */}
            {subscription && subscription.status === "ACTIVE" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(subscription.plan.features as PlanFeatures).map(
                  ([key, enabled]) =>
                    enabled && (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/80 text-gray-700 px-2 py-1 rounded-full border border-gray-200"
                      >
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {FEATURE_LABELS[key] || key}
                      </span>
                    ),
                )}
              </div>
            )}

            {subscription && subscription.status === "ACTIVE" && (
              <div className="mt-3 text-right">
                <button
                  onClick={() => navigate("/plans")}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  Manage Plan →
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="shadow-lg border border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={avtImage || form.getValues("avatar") || undefined}
                alt="Avatar"
                className="object-cover"
              />
              <AvatarFallback>NA</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-[16px] font-semibold">
                My Profile
              </CardTitle>
              <CardDescription>Update your basic information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <FormControl>
                      <FileUpload
                        accept="image/*"
                        label=""
                        onChange={(fileUrl) => {
                          field.onChange(fileUrl);
                          setAvtImage(fileUrl);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <PositionSelector
                        value={field.value as Position}
                        onChange={field.onChange}
                        allowClear
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@gmail.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearOfExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of experience</FormLabel>
                      <FormControl>
                        <InputNumber
                          placeholder="Years of experience"
                          style={{ width: 280 }}
                          min={0}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <SkillInput
                        value={field.value}
                        onChange={field.onChange}
                        suggestions={skillSuggestions}
                      />
                    </FormControl>
                    <FormDescription>
                      Chọn từ danh sách gợi ý hoặc gõ skill rồi nhấn Enter để
                      thêm trực tiếp.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
