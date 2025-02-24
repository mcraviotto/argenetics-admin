'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useUserQuery } from "@/services/auth";
import Cookies from 'js-cookie';
import { LogOut } from "lucide-react";
import { useTransitionRouter } from "next-view-transitions";
import { Button } from "./ui/button";
import Image from "next/image";

export default function Header() {
  const router = useTransitionRouter()

  const { data: user, isLoading } = useUserQuery(undefined);

  const handleLogout = () => {
    Cookies.remove('sessionToken');
    router.push('/');
  }

  const userAvatar = user && user?.userable.first_name.charAt(0) + user?.userable.last_name.charAt(0);

  return (
    <header className="border-b px-6 bg-background">
      <div className="min-h-[60px] flex items-center justify-between h-full">
        <Image src="/argenetics-logo.webp" width={133} height={20} alt="Argenetics" priority />
        <DropdownMenu>
          <DropdownMenuTrigger
            className="focus-visible:ring-offset-0 focus-visible:ring-0"
            asChild
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 shadow-border shadow-md"
            >
              <Avatar className="h-9 w-9 bg-transparent border">
                <AvatarFallback>
                  <p
                    className={cn("font-medium transition-all duration-200",
                      isLoading ? "text-muted-foreground font-normal blur-[6px]" : "blur-none"
                    )}
                  >
                    {isLoading ? "AD" : userAvatar}
                  </p>
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-64 shadow-lg">
            <div className="p-2 px-1">
              <DropdownMenuLabel className="flex items-center gap-3">
                <Avatar className="h-8 w-8 shadow-border shadow-md">
                  <AvatarFallback>{userAvatar}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {user?.userable.first_name} {user?.userable.last_name}
                  </span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </div>
            <DropdownMenuSeparator />
            <div className="p-2 pt-1">
              <Button
                onClick={handleLogout}
                className="w-full h-8"
                size="sm"
                variant="destructive"
              >
                <LogOut strokeWidth={2} aria-hidden="true" />
                <span>Cerrar sesión</span>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}