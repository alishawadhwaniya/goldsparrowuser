import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { authService } from '@/api/services/auth.service';
import { useUser } from '@/hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { useDeviceSize } from '@/hooks/use-responsive';

const AuthForm = () => {
  const [username, setUsername] = useState('admin@admin.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useUser();
  const navigate = useNavigate();
  const { isSmallPhone } = useDeviceSize();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({ username, password });

      if (response.token) {
        toast({
          title: "Login successful",
          description: "Welcome back, " + username,
        });

        login(response);

        navigate('/');
      } else {
        toast({
          title: "Login failed",
          description: "",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred while logging in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="w-full shadow-lg border-0">
        <CardHeader className="space-y-1 navy-gradient rounded-t-md xxs:rounded-t-lg p-4 xxs:p-5 sm:p-6">
          <CardTitle className="text-xl xxs:text-2xl font-bold text-center text-white">Login</CardTitle>
          <CardDescription className="text-center text-gray-200 text-xs xxs:text-sm sm:text-base">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-3 xxs:space-y-4">
            <div className="space-y-1 xxs:space-y-2">
              <Label htmlFor="username" className="text-xs xxs:text-sm">Username</Label>
              <div className="relative">
                <User className="absolute left-2.5 xxs:left-3 top-2.5 xxs:top-3 h-3.5 xxs:h-4 w-3.5 xxs:w-4 text-gray-400" />
                <Input
                  id="username"
                  placeholder="Enter your username"
                  className="pl-8 xxs:pl-10 h-8 xxs:h-10 text-xs xxs:text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1 xxs:space-y-2">
              <Label htmlFor="password" className="text-xs xxs:text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 xxs:left-3 top-2.5 xxs:top-3 h-3.5 xxs:h-4 w-3.5 xxs:w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-8 xxs:pl-10 pr-8 xxs:pr-10 h-8 xxs:h-10 text-xs xxs:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1.5 xxs:right-2.5 top-1.5 xxs:top-2.5 h-5 xxs:h-5 w-5 xxs:w-5 p-0.5 xxs:p-0 text-gray-400 hover:text-gray-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  type="button"
                >
                  {showPassword ?
                    <EyeOff className="h-3.5 xxs:h-4 w-3.5 xxs:w-4" /> :
                    <Eye className="h-3.5 xxs:h-4 w-3.5 xxs:w-4" />
                  }
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="px-3 xxs:px-4 sm:px-6 pb-4 xxs:pb-5 sm:pb-6 pt-0">
          <Button
            className="w-full gold-gradient hover:opacity-90 transition-opacity h-8 xxs:h-9 sm:h-10 text-xs xxs:text-sm rounded"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;

