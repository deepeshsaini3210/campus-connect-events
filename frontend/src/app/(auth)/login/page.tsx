"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Eye, EyeOff, University, Calendar, Users, Award } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // API call to login endpoint
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store JWT token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.success("Login successful!");
      
      // Redirect based on user role
      switch (data.user.role) {
        case 'STUDENT':
          router.push('/dashboard/student');
          break;
        case 'ORGANIZER':
          router.push('/dashboard/organizer');
          break;
        case 'COLLEGE_ADMIN':
          router.push('/dashboard/admin');
          break;
        case 'EXTERNAL_PARTNER':
          router.push('/dashboard/partner');
          break;
        case 'SUPER_ADMIN':
          router.push('/dashboard/super-admin');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 text-white p-12 flex-col justify-between">
        <div className="flex items-center space-x-3 mb-8">
          <University className="h-10 w-10" />
          <span className="text-2xl font-bold">University Event Portal</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Welcome to University Event Portal
          </h1>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            Discover, Register, and Collaborate for Events Across Colleges
          </p>
          
          <div className="space-y-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-800 p-3 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Discover Events</h3>
                <p className="text-blue-100">Find exciting events across all university colleges</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-800 p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Connect & Collaborate</h3>
                <p className="text-blue-100">Network with students and organizers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-800 p-3 rounded-lg">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Easy Registration</h3>
                <p className="text-blue-100">Quick and secure event registration</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-blue-200 text-sm">
          © 2024 University Event Portal. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center space-x-3 mb-8">
            <University className="h-8 w-8 text-blue-900" />
            <span className="text-xl font-bold text-blue-900">University Event Portal</span>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="university.email@edu"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                      }
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link 
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" disabled={isLoading}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" type="button" disabled={isLoading}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                      fill="#0078D4"
                    />
                    <path
                      d="M12 7v5l3.5 2.1.5-.9L13 11V7z"
                      fill="#0078D4"
                    />
                  </svg>
                  Microsoft
                </Button>
              </div>
            </CardContent>
            
            <CardFooter className="pt-4">
              <p className="text-center text-sm text-gray-600 w-full">
                Don't have an account?{" "}
                <Link 
                  href="/auth/register"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
          
          {/* Mobile Hero Section */}
          <div className="lg:hidden mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Discover Events Across Colleges
            </h3>
            <p className="text-sm text-gray-600">
              Join thousands of students and organizers in our university event community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
