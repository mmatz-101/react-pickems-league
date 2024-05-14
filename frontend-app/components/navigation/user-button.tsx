"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Session } from "next-auth";
import Image from "next/image";
import {
  LogOut,
  Moon,
  Settings,
  SquareMousePointer,
  Sun,
  Trophy,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";

export const UserButton = ({ user }: Session) => {
  const { setTheme, theme } = useTheme();
  const [checked, setChecked] = useState(false);

  function setSwitchState() {
    switch (theme) {
      case "dark":
        return setChecked(true);
      case "light":
        return setChecked(false);
      case "system":
        return setChecked(false);
    }
  }

  useEffect(() => {
    setSwitchState();
  }, []);

  if (user)
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <Avatar>
            {user.image && (
              <Image src={user.image} alt={user.name!} fill={true} />
            )}
            {!user.image && (
              <AvatarFallback className="bg-primary/25">
                <div className="font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </AvatarFallback>
            )}
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-2" align="end">
          <div className="mb-4 p-4 flex flex-row gap-2 items-center">
            <Avatar>
              {user.image && (
                <Image src={user.image} alt={user.name!} fill={true} />
              )}
              {!user.image && (
                <AvatarFallback className="bg-primary/25">
                  <div className="font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <p>{user.name}</p>
              <span className="text-xs font-medium text-secondary-foreground">
                {user.email}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="py-2 font-medium cursor-pointer ">
              <User className="mr-2 h-4 w-4" />
              <span>User Dashboard</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem className="py-2 font-medium cursor-pointer ">
              <SquareMousePointer className="mr-2 h-4 w-4" />
              <span>Picks</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem className="py-2 font-medium cursor-pointer ">
              <Trophy className="mr-2 h-4 w-4" />
              <span>Results</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="py-2 font-medium cursor-pointer "
              onClick={(e) => e.stopPropagation()}
            >
              <Sun className="mr-2 h-4 w-4" />
              <Switch
                checked={checked}
                onCheckedChange={(e) => {
                  setChecked((prev) => !prev);
                  if (e) setTheme("dark");
                  if (!e) setTheme("light");
                }}
              />
              <Moon className="ml-2 h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem className="py-2 font-medium cursor-pointer ">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="py-2 font-medium cursor-pointer "
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
};
