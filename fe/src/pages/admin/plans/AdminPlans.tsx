import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { CreditCard, Pencil, Loader2, Plus } from "lucide-react";
import { billingApi } from "@/api/billing.api";
import type { Plan, PlanName } from "@/types/billing.type";
import "../AdminLayout.scss";
import {
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Switch,
} from "antd";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

// All editable feature keys
const FEATURE_KEYS: (keyof Plan["features"])[] = [
  "aiAssistant",
  "advancedAnalytics",
  "prioritySupport",
  "customBranding",
  "apiAccess",
  "exportReports",
];

const FEATURE_LABELS: Record<string, string> = {
  aiAssistant: "AI Assistant",
  advancedAnalytics: "Advanced Analytics",
  prioritySupport: "Priority Support",
  customBranding: "Custom Branding",
  apiAccess: "API Access",
  exportReports: "Export Reports",
};

interface EditForm {
  name: PlanName;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxMembers: number;
  maxProjects: number;
  maxStorage: number;
  isActive: boolean;
  features: Plan["features"];
}

// ─────────────────────────────────────────────
// Create / Edit Modal (useImperativeHandle)
// ─────────────────────────────────────────────
export interface PlanModalRef {
  handleCreate: () => void;
  handleUpdate: (plan: Plan) => void;
}

interface PlanModalProps {
  onSubmitOk: (saved: Plan, isNew: boolean) => void;
}

const PlanModal = React.forwardRef<PlanModalRef, PlanModalProps>(
  ({ onSubmitOk }, ref) => {
    const [form] = Form.useForm<EditForm>();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"create" | "update">("create");
    const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>();

    useImperativeHandle<PlanModalRef, PlanModalRef>(
      ref,
      () => ({
        handleCreate() {
          form.resetFields();
          form.setFieldsValue({
            name: "PRO",
            monthlyPrice: 0,
            yearlyPrice: 0,
            maxMembers: 10,
            maxProjects: 10,
            maxStorage: 5000,
            isActive: true,
            features: {
              aiAssistant: false,
              advancedAnalytics: false,
              prioritySupport: false,
              customBranding: false,
              apiAccess: false,
              exportReports: false,
            },
          });
          setStatus("create");
          setSelectedPlan(undefined);
          setVisible(true);
        },
        handleUpdate(plan: Plan) {
          form.setFieldsValue({
            name: plan.name,
            displayName: plan.displayName,
            description: plan.description,
            monthlyPrice: plan.monthlyPrice,
            yearlyPrice: plan.yearlyPrice,
            maxMembers: plan.maxMembers,
            maxProjects: plan.maxProjects,
            maxStorage: plan.maxStorage,
            isActive: plan.isActive,
            features: { ...plan.features },
          });
          setStatus("update");
          setSelectedPlan(plan);
          setVisible(true);
        },
      }),
      [],
    );

    const handleClose = () => {
      setVisible(false);
      setSelectedPlan(undefined);
      form.resetFields();
    };

    const handleSubmit = async () => {
      try {
        await form.validateFields();
        setLoading(true);
        const values = form.getFieldsValue();
        let saved: Plan;
        if (status === "create") {
          saved = await billingApi.createPlan(
            values as Omit<Plan, "id" | "createdAt" | "updatedAt">,
          );
          message.success("Plan created successfully!");
        } else {
          saved = await billingApi.updatePlan(selectedPlan!.id, values);
          message.success("Plan updated successfully!");
        }
        onSubmitOk(saved, status === "create");
        handleClose();
      } catch (err: any) {
        if (err?.errorFields) return; // Ant Design validation error, don't show
        message.error(
          err?.response?.data?.message ||
            `Failed to ${status === "create" ? "create" : "update"} plan.`,
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <Modal
        open={visible}
        title={status === "create" ? "Create New Plan" : `Edit Plan — ${selectedPlan?.displayName}`}
        onCancel={handleClose}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText={status === "create" ? "Create Plan" : "Save Changes"}
        cancelText="Cancel"
        width={600}
        style={{ top: 24 }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            {/* Display Name */}
            <Col span={status === "create" ? 12 : 24}>
              <Form.Item
                label="Display Name"
                name="displayName"
                rules={[{ required: true, message: "Please enter a display name" }]}
              >
                <Input placeholder="e.g. Pro Plan" />
              </Form.Item>
            </Col>

            {/* Plan Type — only for create */}
            {status === "create" && (
              <Col span={12}>
                <Form.Item
                  label="Plan Type"
                  name="name"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Select.Option value="FREE">FREE</Select.Option>
                    <Select.Option value="PRO">PRO</Select.Option>
                    <Select.Option value="ENTERPRISE">ENTERPRISE</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            )}

            {/* Description */}
            <Col span={24}>
              <Form.Item label="Description" name="description">
                <Input.TextArea
                  rows={2}
                  placeholder="Short description visible to users"
                />
              </Form.Item>
            </Col>

            {/* Prices */}
            <Col span={12}>
              <Form.Item
                label="Monthly Price (VNĐ)"
                name="monthlyPrice"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Yearly Price (VNĐ)"
                name="yearlyPrice"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            {/* Limits */}
            <Col span={8}>
              <Form.Item
                label="Max Members"
                name="maxMembers"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Max Projects"
                name="maxProjects"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Storage (MB)"
                name="maxStorage"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            {/* Features */}
            <Col span={24}>
              <Form.Item label="Features" name="features">
                <FeatureCheckboxGroup />
              </Form.Item>
            </Col>

            {/* Active toggle */}
            <Col span={24}>
              <Form.Item
                label="Plan Active"
                name="isActive"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  },
);

// Custom form control for feature checkboxes
const FeatureCheckboxGroup: React.FC<{
  value?: Plan["features"];
  onChange?: (v: Plan["features"]) => void;
}> = ({ value, onChange }) => {
  const handleChange = (key: keyof Plan["features"], checked: boolean) => {
    onChange?.({ ...(value as Plan["features"]), [key]: checked });
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px 16px",
        padding: "12px 14px",
        border: "1px solid #d9d9d9",
        borderRadius: 8,
      }}
    >
      {FEATURE_KEYS.map((key) => (
        <Checkbox
          key={key}
          checked={value?.[key] ?? false}
          onChange={(e) => handleChange(key, e.target.checked)}
        >
          {FEATURE_LABELS[key]}
        </Checkbox>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const AdminPlansPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedId, setSavedId] = useState<number | null>(null);
  const modalRef = useRef<PlanModalRef>(null);

  useEffect(() => {
    billingApi
      .getPlans()
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (saved: Plan, isNew: boolean) => {
    if (isNew) {
      setPlans((prev) => [...prev, saved]);
    } else {
      setPlans((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    }
    setSavedId(saved.id);
    setTimeout(() => setSavedId(null), 2500);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Plan Configuration</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#6b7280", fontSize: 14 }}>
            Total: <strong>{plans.length}</strong> plans
          </span>
          <button
            className="admin-btn btn-primary"
            onClick={() => modalRef.current?.handleCreate()}
          >
            <Plus size={15} />
            Create Plan
          </button>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">
            <Loader2 size={18} className="animate-spin" />
            Loading plans...
          </div>
        ) : plans.length === 0 ? (
          <div className="admin-empty">
            <CreditCard size={40} />
            <p>No plans found.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Monthly Price</th>
                <th>Yearly Price</th>
                <th>Members</th>
                <th>Projects</th>
                <th>Storage</th>
                <th>Features</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr
                  key={plan.id}
                  style={
                    savedId === plan.id
                      ? { background: "#f0fdf4" }
                      : undefined
                  }
                >
                  <td>
                    <div>
                      <span style={{ fontWeight: 700, color: "#111827" }}>
                        {plan.displayName}
                      </span>
                      <span
                        className={`admin-badge ${
                          plan.name === "FREE" ? "badge-user" : "badge-admin"
                        }`}
                        style={{ marginLeft: 8 }}
                      >
                        {plan.name}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                      {plan.description}
                    </div>
                  </td>
                  <td>
                    {plan.monthlyPrice === 0 ? (
                      <span style={{ color: "#10b981", fontWeight: 600 }}>Free</span>
                    ) : (
                      formatVND(plan.monthlyPrice)
                    )}
                  </td>
                  <td>
                    {plan.yearlyPrice === 0 ? (
                      <span style={{ color: "#10b981", fontWeight: 600 }}>Free</span>
                    ) : (
                      formatVND(plan.yearlyPrice)
                    )}
                  </td>
                  <td>{plan.maxMembers >= 999 ? "∞" : plan.maxMembers}</td>
                  <td>{plan.maxProjects >= 999 ? "∞" : plan.maxProjects}</td>
                  <td>
                    {plan.maxStorage >= 1000
                      ? `${plan.maxStorage / 1000} GB`
                      : `${plan.maxStorage} MB`}
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {Object.entries(plan.features).map(([key, enabled]) =>
                        enabled ? (
                          <span
                            key={key}
                            className="admin-badge badge-admin"
                            style={{ fontSize: 10 }}
                          >
                            {FEATURE_LABELS[key] || key}
                          </span>
                        ) : null,
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${plan.isActive ? "badge-active" : "badge-inactive"}`}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="admin-btn btn-ghost"
                      onClick={() => modalRef.current?.handleUpdate(plan)}
                      title="Edit plan"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PlanModal ref={modalRef} onSubmitOk={handleSaved} />
    </div>
  );
};

export default AdminPlansPage;
