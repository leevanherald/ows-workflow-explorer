
import React, { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, TextField, Button as MuiButton, Container, Box, Typography } from '@mui/material';
import { Button as AntButton, Form as AntForm, Input as AntInput, Checkbox as AntCheckbox } from 'antd';
import { Link as ChakraLink } from '@chakra-ui/react';
import 'antd/dist/reset.css';

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
    <div className="min-h-screen flex items-center justify-center p-4" 
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
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card 
          elevation={24} 
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 2
          }}
        >
          <CardHeader sx={{ textAlign: 'center', pb: 2, pt: 3 }}>
            <Box display="flex" justifyContent="center" mb={3}>
              <Box 
                sx={{ 
                  backgroundColor: 'white', 
                  p: 2, 
                  borderRadius: 1,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <img 
                  src="/lovable-uploads/e99d473b-f728-401b-951d-2fccd7d2a50f.png" 
                  alt="Barclays Logo" 
                  style={{ height: '64px', width: 'auto' }}
                />
              </Box>
            </Box>
            <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary" mb={1}>
              OWS Workflow Explorer
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Secure access to your workflow management system
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <Shield size={16} color="#666" />
              <Typography variant="caption" color="text.secondary">
                Enterprise-grade security
              </Typography>
            </Box>
          </CardHeader>
          
          <CardContent sx={{ px: 3, pb: 3 }}>
            <AntForm 
              layout="vertical" 
              onFinish={handleSubmit}
              style={{ marginBottom: 24 }}
            >
              <AntForm.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
                style={{ marginBottom: 16 }}
              >
                <AntInput
                  size="large"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </AntForm.Item>
              
              <AntForm.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
                style={{ marginBottom: 16 }}
              >
                <AntInput.Password
                  size="large"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  iconRender={(visible) => visible ? <Eye size={16} /> : <EyeOff size={16} />}
                />
              </AntForm.Item>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <AntCheckbox>Keep me signed in</AntCheckbox>
                <ChakraLink color="blue.500" fontSize="sm" fontWeight="medium">
                  Need help?
                </ChakraLink>
              </Box>

              <MuiButton 
                type="submit" 
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  height: 48,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)',
                  }
                }}
              >
                Sign In Securely
              </MuiButton>
            </AntForm>

            <Box mt={3} pt={2} borderTop="1px solid #e0e0e0" textAlign="center">
              <Typography variant="body2" color="text.secondary" mb={1}>
                Authorized personnel only
              </Typography>
              <Typography variant="caption" color="text.secondary">
                For technical support, contact your system administrator
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
      
      <Box 
        position="absolute" 
        bottom={0} 
        left={0} 
        p={1.5}
        sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}
      >
        © 2024 Barclays Bank PLC. All rights reserved.
      </Box>
    </div>
  );
};

export default Login;
