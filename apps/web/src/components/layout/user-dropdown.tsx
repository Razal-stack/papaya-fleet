import { Avatar, AvatarFallback, AvatarImage } from "@papaya-fleet/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@papaya-fleet/ui/components/dropdown-menu";
import { LogOut } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";

interface UserDropdownProps {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  } | null;
}

export function UserDropdown({ user }: UserDropdownProps) {
  const { signOut } = useAuth();

  if (!user) {
    return null;
  }

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-9 w-9 rounded-full outline-none">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-md"
        align="end"
      >
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
        </div>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
