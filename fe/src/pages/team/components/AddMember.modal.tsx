import { UserSelector } from "@/components/element/selector/UserSelector";
import { Modal } from "antd";
import React, { useImperativeHandle, useState } from "react";
import { alert } from "@/provider/AlertService";
import { User } from "@/types/user.type";
import { TeamMemberRole } from "@/types/team.type";
import AddMemberInfoCardModal from "./Add.MemberInfoCard.modal";

export interface AddMemberModal {
  handleAdd: () => void;
}
interface AddMemberModalProps {
  onClose: () => void;
  onSubmitOk: (payload: any) => void;
}

export const AddMemberModal = React.forwardRef(
  ({ onClose, onSubmitOk }: AddMemberModalProps, ref) => {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [selectedMem, setSelectedMem] = useState<number>();
    const [selectedMemObj, setSelectedMemObj] = useState<User>();
    const [selectedRole, setSelectedRole] = useState<TeamMemberRole>(
      TeamMemberRole.MEMBER
    );

    useImperativeHandle(ref, () => ({
      handleAdd: () => {
        setVisible(true);
      },
    }));

    const submitForm = async () => {
      if (!selectedMem) {
        alert("Please choose one peple!");
        return;
      }
      setLoading(true);
      try {
        onSubmitOk({
          userId: selectedMem,
          role: selectedRole,
        });
        setVisible(false);
      } catch (error) {
        console.error("Failed to add member:", error);
      } finally {
        setLoading(false);
      }
      handleClose();
    };

    const handleClose = () => {
      onClose?.();
      setVisible(false);
      setSelectedMem(undefined);
      setSelectedMemObj(undefined);
      setSelectedRole(TeamMemberRole.MEMBER);
    };

    return (
      <Modal
        onCancel={() => {
          handleClose();
        }}
        open={visible}
        title={"Add member"}
        style={{ top: 20 }}
        width={700}
        confirmLoading={loading}
        onOk={submitForm}
        destroyOnHidden={true}
      >
        <UserSelector
          placeholder="Select members to add"
          onSelect={(value) => {
            setSelectedMem(value.id);
            setSelectedMemObj(value);
          }}
          takeObject
          takeAll
        />
        {selectedMemObj && (
          <AddMemberInfoCardModal
            member={selectedMemObj}
            role={selectedRole}
            setRole={setSelectedRole}
          />
        )}
      </Modal>
    );
  }
);
