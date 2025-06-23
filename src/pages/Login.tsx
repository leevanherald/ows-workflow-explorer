
import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Lock, User } from 'lucide-react';
import { 
  Card, 
  CardBody, 
  Input, 
  Button, 
  Checkbox, 
  Link,
  Divider,
  NextUIProvider
} from '@nextui-org/react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { username, password, rememberMe });
    // Add login logic here
  };

  return (
    <NextUIProvider>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000" />
        
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl border-0">
          <CardBody className="p-8">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl inline-block mb-6 shadow-lg">
                <img 
                  src="/lovable-uploads/e99d473b-f728-401b-951d-2fccd7d2a50f.png" 
                  alt="Barclays Logo" 
                  className="h-12 w-auto filter brightness-0 invert"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                OWS Workflow Explorer
              </h1>
              <p className="text-gray-600 text-sm mb-2">
                Secure access to your workflow management system
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Shield size={14} />
                <span className="text-xs">Enterprise-grade security</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="text"
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                startContent={<User className="text-gray-400" size={18} />}
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-gray-700",
                  inputWrapper: "border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                }}
                isRequired
              />

              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startContent={<Lock className="text-gray-400" size={18} />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-gray-700",
                  inputWrapper: "border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                }}
                isRequired
              />

              <div className="flex justify-between items-center">
                <Checkbox
                  isSelected={rememberMe}
                  onValueChange={setRememberMe}
                  size="sm"
                  classNames={{
                    label: "text-gray-600 text-sm"
                  }}
                >
                  Keep me signed in
                </Checkbox>
                <Link 
                  href="#" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Need help?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                size="lg"
              >
                Sign In Securely
              </Button>
            </form>

            <Divider className="my-6" />

            {/* Footer */}
            <div className="text-center space-y-2">
              <p className="text-gray-600 text-sm font-medium">
                Authorized personnel only
              </p>
              <p className="text-gray-500 text-xs">
                For technical support, contact your system administrator
              </p>
            </div>
          </CardBody>
        </Card>
        
        {/* Copyright */}
        <div className="absolute bottom-4 left-4 text-white/60 text-xs">
          © 2024 Barclays Bank PLC. All rights reserved.
        </div>
      </div>
    </NextUIProvider>
  );
};

export default Login;
