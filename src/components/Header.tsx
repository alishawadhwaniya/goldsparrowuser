import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut, Menu, Settings, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useResponsive } from "@/hooks/use-responsive";

const Header = () => {
  const { user, logout } = useUser();
  const username = user?.username || 'User';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile } = useResponsive();

  return (
    <header className="bg-white border-b sticky top-0 z-30">
      <div className="container-responsive flex items-center justify-between h-16">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-800 font-bold text-lg">
              GS
            </div>
            <span className="ml-2 text-xl font-semibold hidden sm:inline-block">
              GoldSparrow
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="relative">
            {/* <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Bell className="h-5 w-5" />
            </Button>
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] bg-red-500">
              3
            </Badge> */}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative pl-2 pr-6 h-8 flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-gold-200">
                  <AvatarFallback className="bg-navy-700 text-white">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-red-500 focus:text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="md:hidden flex items-center">
          <div className="relative mr-2">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Bell className="h-5 w-5" />
            </Button>
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] bg-red-500">
              3
            </Badge>
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[75vw] sm:w-[350px] p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-800 font-bold text-lg">
                      GS
                    </div>
                    <span className="font-semibold">GoldSparrow</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-10 w-10 border-2 border-gold-200">
                      <AvatarFallback className="bg-navy-700 text-white">
                        {username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{username}</p>
                      <p className="text-sm text-muted-foreground">User</p>
                    </div>
                  </div>

                  <nav className="space-y-1">
                    {/* <Button variant="ghost" className="w-full justify-start" onClick={() => { }}>
                      <User className="mr-2 h-5 w-5" />
                      Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { }}>
                      <Settings className="mr-2 h-5 w-5" />
                      Settings
                    </Button> */}
                    <Button variant="ghost" className="w-full justify-start text-red-500" onClick={logout}>
                      <LogOut className="mr-2 h-5 w-5" />
                      Log out
                    </Button>
                  </nav>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
