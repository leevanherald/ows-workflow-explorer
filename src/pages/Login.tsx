
import React, { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { username, password });
    // Add login logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-content-center p-4" 
         style={{
           background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #334155 100%)',
           position: 'relative'
         }}>
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.3
        }}
      />
      
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center border-0 bg-transparent pb-4 pt-6">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded shadow-md">
                <img 
                  src="/lovable-uploads/e99d473b-f728-401b-951d-2fccd7d2a50f.png" 
                  alt="Barclays Logo" 
                  className="h-16 w-auto"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">OWS Workflow Explorer</h1>
            <p className="text-gray-600">Secure access to your workflow management system</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield size={16} className="text-gray-500" />
              <small className="text-gray-500">Enterprise-grade security</small>
            </div>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-900">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm font-medium">
                    Keep me signed in
                  </Label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                  Need help?
                </a>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                Sign In Securely
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Authorized personnel only
                </p>
                <p className="text-xs text-gray-500">
                  For technical support, contact your system administrator
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="absolute bottom-0 left-0 p-3 text-xs text-white/60">
        © 2024 Barclays Bank PLC. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
