"use client";

import { Modal } from "antd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTeamSchema, CreateTeamDto } from "../handler/team.dto";
import { Button } from "@/components/element/button";
import "../styles/modal.scss";
import RequiredLabel from "@/components/element/form/RequiredLabel";
import { IoPeopleOutline } from "react-icons/io5";

interface Props {
  open: boolean;
  onCancel: () => void;
  onSubmit?: (values: CreateTeamDto) => void;
  loading?: boolean;
}

export default function CreateTeamModal({
  open,
  onCancel,
  onSubmit,
  loading = false,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTeamDto>({
    resolver: zodResolver(CreateTeamSchema.pick({ key: true, name: true })),
    mode: "onChange",
  });

  const submit = (data: CreateTeamDto) => {
    onSubmit?.(data);
  };

  const handleClose = () => {
    reset();
    onCancel();
  };

  return (
    <Modal
      open={open}
      footer={null}
      onCancel={handleClose}
      width={440}
      title={
        <div className="ctm__title">
          <IoPeopleOutline className="icon" />
          <span>Create team</span>
        </div>
      }
      destroyOnHidden
      className="ctm-modal"
    >
      <form className="ctm__form" onSubmit={handleSubmit(submit)}>
        <p className="ctm__note">
          Required fields are marked with an asterisk <span>*</span>
        </p>

        <div className="form-group">
          <RequiredLabel required>Team name</RequiredLabel>
          <input
            id="name"
            type="text"
            placeholder="Team name"
            {...register("name")}
          />
          {errors.name && (
            <p className="error">{errors.name.message?.toString()}</p>
          )}
        </div>

        <div className="form-group">
          <RequiredLabel required>Team key</RequiredLabel>
          <input
            id="key"
            type="text"
            placeholder="your key (e.g., dev-team)"
            {...register("key")}
          />
          {errors.key && (
            <p className="error">{errors.key.message?.toString()}</p>
          )}
        </div>

        <div className="ctm__footer">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="btn-cancel"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || isSubmitting}>
            {loading || isSubmitting ? "Creating..." : "Create"}
          </Button>
        </div>

        <p className="ctm__policy">
          This site is protected by reCAPTCHA and the Google{" "}
          <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a>{" "}
          apply.
        </p>
      </form>
    </Modal>
  );
}
