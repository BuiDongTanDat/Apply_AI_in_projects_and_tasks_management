import { User } from "@/types/user.type";
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";

interface UserInfoProps {
  user: User;
}

const UserInfo = ({ user }: UserInfoProps) => {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar>
        <AvatarImage
          src={user.avatar || "https://github.com/shadcn.png"}
          alt={user.name || "User"}
          className="object-cover"
        />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-steel-gray-950 truncate">
          {user.name || "Dev"}
        </span>
        <span className="text-xs text-steel-gray-500 truncate flex items-center gap-1">
          {user.email}
        </span>
      </div>
    </div>
  );
};

export default UserInfo;
