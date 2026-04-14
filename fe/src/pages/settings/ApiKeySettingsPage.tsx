import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Plus, RefreshCw, Trash2 } from "lucide-react";

import { apiKeyApi } from "@/api/api-key.api";
import type {
  ApiKey,
  ApiKeyUsage,
  ApiKeyUsageOverview,
  ApiProvider,
} from "@/types/api-key.type";
import { GroqModelName, GeminiModelName } from "@/types/api-key.type";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { alert } from "@/provider/AlertService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Button from "@/components/element/button/BaseButton";

const apiKeySchema = z.object({
  name: z.string().min(2, "Name is too short"),
  key: z.string().min(10, "API key seems too short"),
  provider: z.enum(["groq", "gemini"]),
  modelname: z.string().min(1, "Please select a model"),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

export default function ApiKeySettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [usageLoading, setUsageLoading] = useState(false);

  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [usageOverview, setUsageOverview] =
    useState<ApiKeyUsageOverview | null>(null);
  const [usages, setUsages] = useState<ApiKeyUsage[]>([]);
  const [usagePage, setUsagePage] = useState(1);
  const [usageTotalPages, setUsageTotalPages] = useState(1);
  const [usageTotal, setUsageTotal] = useState(0);

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { name: "", key: "", provider: "groq", modelname: "" },
  });

  const selectedKeyId = useMemo(
    () => keys.find((k) => k.isSelected)?.id ?? null,
    [keys],
  );

  const loadKeys = async () => {
    setLoading(true);
    try {
      const data = await apiKeyApi.getApiKeys();
      setKeys(data ?? []);
    } catch (error) {
      console.error("Failed to load API keys", error);
      alert("Failed to load API keys", "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadKeys();
  }, []);

  useEffect(() => {
    if (!detailOpen || !selectedKey) return;
    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const [overviewRes, usageRes] = await Promise.all([
          apiKeyApi.getApiKeyUsageOverview(selectedKey.id),
          apiKeyApi.getApiKeyUsages(selectedKey.id, {
            page: usagePage,
            limit: 20,
          }),
        ]);
        setUsageOverview(overviewRes);
        setUsages(usageRes.usages);
        setUsageTotalPages(usageRes.page.pages);
        setUsageTotal(usageRes.page.total);
      } catch (error) {
        console.error("Failed to load usage detail", error);
        alert("Failed to load usage detail", "Error", "error");
      } finally {
        setDetailLoading(false);
        setUsageLoading(false);
      }
    };
    setUsageLoading(true);
    void fetchDetail();
  }, [detailOpen, selectedKey, usagePage]);

  const handleOpenModal = () => {
    form.reset({ name: "", key: "", provider: "groq", modelname: "" });
    setModalOpen(true);
  };

  const handleCreate = async (values: ApiKeyFormValues) => {
    setSubmitting(true);
    try {
      await apiKeyApi.createApiKey({
        name: values.name.trim(),
        key: values.key.trim(),
        provider: values.provider,
        modelname: values.modelname as GroqModelName | GeminiModelName,
      });
      setModalOpen(false);
      await loadKeys();
      alert("API key added successfully", "Success", "success");
    } catch (error) {
      console.error("Failed to create API key", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (key: ApiKey) => {
    setTogglingId(key.id);
    try {
      await apiKeyApi.updateApiKey(key.id, { isActive: !key.isActive });
      await loadKeys();
    } catch (error) {
      console.error("Failed to update API key", error);
      alert("Failed to update API key", "Error", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (key: ApiKey) => {
    if (!window.confirm(`Delete API key "${key.name}"?`)) return;
    setDeletingId(key.id);
    try {
      await apiKeyApi.deleteApiKey(key.id);
      await loadKeys();
    } catch (error) {
      console.error("Failed to delete API key", error);
      alert("Failed to delete API key", "Error", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectDefault = async (key: ApiKey | null) => {
    const targetId = key?.id ?? null;
    setSelectingId(targetId ?? -1);
    try {
      await apiKeyApi.setSelectedApiKey({
        selectedApiKeyId: targetId,
      });
      await loadKeys();
    } catch (error) {
      console.error("Failed to update selected API key", error);
      alert("Failed to update selected API key", "Error", "error");
    } finally {
      setSelectingId(null);
    }
  };

  const totalTokens = useMemo(
    () =>
      keys.reduce(
        (sum, k) => sum + (typeof k.totalTokensUsed === "number" ? k.totalTokensUsed : 0),
        0,
      ),
    [keys],
  );

  const columns: ColumnDef<ApiKey>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: () => (
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Name
          </span>
        ),
        cell: ({ row }) => {
          const key = row.original;
          return (
            <button
              type="button"
              className="text-[11px] font-medium text-blue-600 italic underline underline-offset-2 hover:text-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedKey(key);
                setUsagePage(1);
                setDetailOpen(true);
              }}
            >
              {key.name}
            </button>
          );
        },
      },
      {
        accessorKey: "provider",
        header: () => (
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Provider
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-[11px] text-gray-600">
            {row.original.provider.toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "modelname",
        header: () => (
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Model
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-[11px] text-gray-600 max-w-[220px] truncate inline-block">
            {row.original.modelname}
          </span>
        ),
      },
      {
        id: "status",
        header: () => (
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Status
          </span>
        ),
        cell: ({ row }) => {
          const key = row.original;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                key.isActive
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}
            >
              {key.isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        accessorKey: "totalTokensUsed",
        header: () => (
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Total Tokens
          </span>
        ),
        cell: ({ row }) => {
          const value = row.original.totalTokensUsed;
          return (
            <span className="text-[11px] text-gray-700 tabular-nums">
              {typeof value === "number" ? value.toLocaleString("en-US") : "—"}
            </span>
          );
        },
      },
      {
        id: "default",
        header: () => (
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Default
          </span>
        ),
        cell: ({ row }) => {
          const key = row.original;
          return key.isSelected ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-600 text-white">
              Default
            </span>
          ) : (
            <Button
              variant="ghost"
              className="text-[11px] px-2 py-1"
              isLoading={selectingId === key.id}
              onClick={(e) => {
                e.stopPropagation();
                void handleSelectDefault(key);
              }}
              disabled={!key.isActive}
            >
              Set as default
            </Button>
          );
        },
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => {
          const key = row.original;
          return (
            <div className="inline-flex items-center gap-1 justify-end w-full">
              <Button
                variant="text"
                className="text-[10px] px-2 py-1"
                isLoading={togglingId === key.id}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleToggleActive(key);
                }}
              >
                {key.isActive ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="dangerText"
                className="text-[10px] px-2 py-1"
                isLoading={deletingId === key.id}
                leftIcon={<Trash2 className="w-3 h-3" />}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDelete(key);
                }}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [deletingId, selectingId, togglingId],
  );

  const table = useReactTable({
    data: keys,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="max-w-8xl mx-auto py-10 px-4 text-xs space-y-6">
      <Card className="shadow-lg border border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">
                BYOK Groq API Keys
              </CardTitle>
              <p className="text-[11px] text-gray-500">
                Manage your personal Groq API keys and choose the default key for AI
                features.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => void loadKeys()}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3 h-3" />}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleOpenModal}
              leftIcon={<Plus className="w-3 h-3" />}
            >
              Add Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {keys.length === 0 && !loading && (
            <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400 text-[11px]">
              No API keys yet. Click &quot;Add Key&quot; to connect your first Groq
              API key.
            </div>
          )}

          {keys.length > 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-gray-500">
                <div>
                  <span className="font-medium text-gray-700">
                    {keys.length} key{keys.length > 1 ? "s" : ""}&nbsp;
                  </span>
                  connected. Total tokens used:{" "}
                  <span className="font-semibold text-gray-800">
                    {totalTokens.toLocaleString("en-US")}
                  </span>
                  .
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="w-full text-[11px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className={`px-4 py-2 font-semibold ${
                              header.column.id === "totalTokensUsed"
                                ? "text-right"
                                : "text-left"
                            }`}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-4 py-4 text-center text-gray-500"
                        >
                          Loading API keys...
                        </td>
                      </tr>
                    ) : table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-4 py-6 text-center text-gray-400 italic"
                        >
                          No API keys found.
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className={`px-4 py-2 ${
                                cell.column.id === "totalTokensUsed"
                                  ? "text-right"
                                  : "text-left"
                              }`}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Groq API Key</DialogTitle>
            <DialogDescription>
              Paste your Groq API key. It will be validated and stored securely on
              the server — the raw key will never be shown again.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreate)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Personal Groq Key"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <FormControl>
                      <select
                        className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value as ApiProvider;
                          field.onChange(value);
                          // reset model when provider changes
                          form.setValue("modelname", "");
                        }}
                      >
                        <option value="groq">Groq</option>
                        <option value="gemini">Gemini</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelname"
                render={({ field }) => {
                  const provider = form.watch("provider");
                  const groqModels = Object.values(GroqModelName);
                  const geminiModels = Object.values(GeminiModelName);
                  const options =
                    provider === "gemini" ? geminiModels : groqModels;
                  return (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <select
                          className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs"
                          {...field}
                        >
                          <option value="">Select a model</option>
                          {options.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Groq API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="gsk_..."
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                >
                  Save key
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Detail: usage overview + history */}
      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedKey(null);
            setUsages([]);
            setUsageOverview(null);
            setUsagePage(1);
            setUsageTotalPages(1);
            setUsageTotal(0);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              API Key usage — {selectedKey?.name ?? "Loading"}
            </DialogTitle>
            <DialogDescription>
              Overview of token usage and recent requests for this key.
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-10 text-center text-xs text-gray-500">
              Loading usage...
            </div>
          ) : !usageOverview ? (
            <div className="py-6 text-xs text-gray-400">
              No usage data available yet.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview stats */}
              <div className="grid sm:grid-cols-3 gap-3 text-[11px]">
                <div className="border border-gray-100 rounded-lg p-3">
                  <div className="text-gray-500">Total requests</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {usageOverview.totalRequests.toLocaleString("en-US")}
                  </div>
                  <div className="mt-1 text-[10px] text-gray-400">
                    Chat: {usageOverview.totalChatRequests} · Vision:{" "}
                    {usageOverview.totalVisionRequests}
                  </div>
                </div>
                <div className="border border-gray-100 rounded-lg p-3">
                  <div className="text-gray-500">Total tokens</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {usageOverview.totalTokens.toLocaleString("en-US")}
                  </div>
                  <div className="mt-1 text-[10px] text-gray-400">
                    Prompt:{" "}
                    {usageOverview.totalPromptTokens.toLocaleString("en-US")} ·
                    Completion:{" "}
                    {usageOverview.totalCompletionTokens.toLocaleString("en-US")}
                  </div>
                </div>
                <div className="border border-gray-100 rounded-lg p-3">
                  <div className="text-gray-500">Avg latency (s)</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {usageOverview.avgTotalTime.toFixed(3)}
                  </div>
                  <div className="mt-1 text-[10px] text-gray-400">
                    Prompt: {usageOverview.avgPromptTime.toFixed(3)} ·
                    Completion: {usageOverview.avgCompletionTime.toFixed(3)}
                  </div>
                </div>
              </div>

              {/* Usage table */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                {usageLoading ? (
                  <div className="py-8 text-center text-xs text-gray-500">
                    Loading usage...
                  </div>
                ) : usages.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No requests yet for this key.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="text-left px-3 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Time
                            </th>
                            <th className="text-left px-3 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Type
                            </th>
                            <th className="text-right px-3 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Prompt
                            </th>
                            <th className="text-right px-3 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Completion
                            </th>
                            <th className="text-right px-3 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Total
                            </th>
                            <th className="text-right px-3 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                              Total time (s)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {usages.map((u) => (
                            <tr
                              key={u.id}
                              className="border-b border-gray-50 last:border-0"
                            >
                              <td className="px-3 py-2 text-gray-700">
                                {new Date(u.createdAt).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="px-3 py-2 text-gray-600">
                                {u.requestType}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-700">
                                {u.promptTokens.toLocaleString("en-US")}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-700">
                                {u.completionTokens.toLocaleString("en-US")}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-900 font-medium">
                                {u.totalTokens.toLocaleString("en-US")}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-700">
                                {u.totalTime.toFixed(3)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {usageTotalPages > 1 && (
                      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 text-[10px] text-gray-500">
                        <div>
                          Page {usagePage} of {usageTotalPages} ·{" "}
                          {usageTotal.toLocaleString("en-US")} records
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            disabled={usagePage <= 1}
                            onClick={() => {
                              setUsageLoading(true);
                              setUsagePage((p) => Math.max(1, p - 1));
                            }}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="ghost"
                            disabled={usagePage >= usageTotalPages}
                            onClick={() => {
                              setUsageLoading(true);
                              setUsagePage((p) =>
                                Math.min(usageTotalPages, p + 1),
                              );
                            }}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

