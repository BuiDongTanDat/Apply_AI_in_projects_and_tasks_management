import { Col, Form, Input, message, Modal, Row } from "antd";
import { Rule } from "antd/lib/form";
import { projectApi } from "@/api/project.api";
import React, { useImperativeHandle, useState } from "react";
import { Project } from "@/types/project.type";
import { useAppSelector } from "@/store/hook";

const rules: Rule[] = [{ required: true }];

export interface ProjectModal {
  handleCreate: () => void;
  handleUpdate: (Project: Project) => void;
}
interface ProjectModalProps {
  onClose: () => void;
  onSubmitOk: () => void;
}

export const ProjectModal = React.forwardRef(
  ({ onClose, onSubmitOk }: ProjectModalProps, ref) => {
    const [form] = Form.useForm<Project>();
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [status, setStatus] = useState<"create" | "update">("create");
    const [selectedProject, setSelectedProject] = useState<Project>();

    const team = useAppSelector((state) => state.selectedTeam.team);

    useImperativeHandle<any, ProjectModal>(
      ref,
      () => ({
        handleCreate() {
          form.resetFields();
          setVisible(true);
          setStatus("create");
          setSelectedProject(undefined);
        },
        handleUpdate(Project: Project) {
          form.setFieldsValue({ ...Project });
          setVisible(true);
          setStatus("update");
          setSelectedProject(Project);
        },
      }),
      [],
    );

    const getPayload = () => {
      const { ...rest } = form.getFieldsValue();
      return { ...rest, teamId: team?.id };
    };

    const submitForm = async () => {
      try {
        setLoading(true);
        await form.validateFields();
        const data = getPayload();
        let res: any = undefined;
        switch (status) {
          case "create":
            res = await projectApi.create(data);
            message.success("Create Project successfully!");
            break;
          case "update":
            res = await projectApi.update(selectedProject?.id || 0, data);
            message.success("Update Project successfully!");
            break;
        }
        console.log("res", res);
        onSubmitOk();
        handleClose();
      } finally {
        setLoading(false);
      }
    };

    const handleClose = () => {
      onClose?.();
      setVisible(false);
      setSelectedProject(undefined);
    };

    return (
      <Modal
        onCancel={() => {
          handleClose();
        }}
        open={visible}
        title={status == "create" ? "Create project" : "Update project"}
        style={{ top: 20 }}
        width={700}
        confirmLoading={loading}
        onOk={submitForm}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Name" name="name" rules={rules}>
                <Input placeholder="Enter project name" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Description" name="description" rules={rules}>
                <Input.TextArea placeholder="Enter project description" rows={4} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  },
);
