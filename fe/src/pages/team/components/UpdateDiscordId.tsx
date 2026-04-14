import { Modal, Input } from "antd";
import React, { useImperativeHandle, useState } from "react";
import { Button } from "@/components/element/button";
import { teamApi } from "@/api/team.api";

export interface UpdateDiscordIdModal {
  open: (currentDiscordId?: string) => void;
}

interface UpdateDiscordIdModalProps {
  onClose: () => void;
  onSubmitOk: (discordServerId: string) => void;
  teamId: number;
}

export const UpdateDiscordIdModal = React.forwardRef<
  UpdateDiscordIdModal,
  UpdateDiscordIdModalProps
>(({ onClose, onSubmitOk, teamId }, ref) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discordId, setDiscordId] = useState<string>("");

  useImperativeHandle(ref, () => ({
    open: (currentDiscordId?: string) => {
      setDiscordId(currentDiscordId || "");
      setVisible(true);
    },
  }));

  const handleClose = () => {
    setVisible(false);
    setDiscordId("");
    onClose();
  };

  const handleOk = async () => {
    if (!discordId.trim()) {
      return;
    }

    try {
      setLoading(true);
      // TODO: Call API to update discord server ID
      teamApi.updateDiscordId(teamId, discordId.trim());
      onSubmitOk(discordId.trim());
      handleClose();
    } catch (error) {
      console.error("Error updating discord ID:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      title={
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span>🎮</span>
          <span>Update Discord Server ID</span>
        </div>
      }
      width={550}
      destroyOnClose
    >
      <div className="space-y-4 pt-4">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
            <span>How to get Discord Server ID:</span>
          </p>
          <ol className="text-xs text-blue-800 space-y-1.5 ml-6 list-decimal">
            <li>Open Discord and enter the server you want to connect</li>
            <li>Right-click on the server name (top left corner)</li>
            <li>
              Select <span className="font-semibold">"Copy Server ID"</span> (if
              not visible, enable Developer Mode in User Settings → Advanced)
            </li>
            <li>Paste Server ID in the field below</li>
          </ol>
          <div className="pt-2 border-t border-blue-200 mt-3">
            <p className="text-xs text-blue-700 flex items-start gap-2">
              <span>
                Developer Mode: User Settings → App Settings → Advanced →
                Developer Mode (turn ON)
              </span>
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Discord Server ID <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Example: 1234567890123456789"
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            className="w-full font-mono"
            size="large"
            maxLength={20}
          />
          <p className="text-xs text-gray-500">
            Server ID is a long sequence of 18-19 characters
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleOk} disabled={loading || !discordId.trim()}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

UpdateDiscordIdModal.displayName = "UpdateDiscordIdModal";
