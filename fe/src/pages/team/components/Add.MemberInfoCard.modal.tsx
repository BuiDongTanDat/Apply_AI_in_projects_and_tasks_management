import { EnumSelector } from "@/components/element/selector/EnumSelector";
import { TeamMemberRole, TeamMemberRoleLabels } from "@/types/team.type";
import { User } from "@/types/user.type";

interface AddMemberInfoCardModalProps {
  member: User;
  role: TeamMemberRole;
  setRole: (role: TeamMemberRole) => void;
}

const AddMemberInfoCardModal = (props: AddMemberInfoCardModalProps) => {
  // destructure props
  const { member, role, setRole } = props;

  return (
    <div className="w-full bg-gray-50 p-4 rounded-md border border-gray-200 mt-4 flex items-center gap-4">
      <div className="flex-1">
        <p className="font-semibold ">{member.name}</p>
        <span className="text-sm text-gray-400 italic">{member.email}</span>
      </div>
      <div className="w-48">
        <EnumSelector
          label={TeamMemberRoleLabels}
          value={role}
          onChange={(newRole) => {
            if (typeof newRole === "string") {
              setRole(newRole as TeamMemberRole);
            }
          }}
        />
      </div>
    </div>
  );
};

export default AddMemberInfoCardModal;
