
import React, { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Card, Form, Input, Button, Checkbox, Typography, Space, Divider } from 'antd';
import 'antd/dist/reset.css';

const { Title, Text } = Typography;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (values) => {
    console.log('Login attempt:', values);
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
      
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>
        <Card 
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '24px' 
            }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '16px', 
                borderRadius: '4px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <img 
                  src="/lovable-uploads/e99d473b-f728-401b-951d-2fccd7d2a50f.png" 
                  alt="Barclays Logo" 
                  style={{ height: '64px', width: 'auto' }}
                />
              </div>
            </div>
            <Title level={2} style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              OWS Workflow Explorer
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
              Secure access to your workflow management system
            </Text>
            <Space align="center" style={{ color: '#666' }}>
              <Shield size={16} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Enterprise-grade security
              </Text>
            </Space>
          </div>
          
          <Form 
            layout="vertical" 
            onFinish={handleSubmit}
            style={{ marginBottom: '24px' }}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
              style={{ marginBottom: '16px' }}
            >
              <Input
                size="large"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Item>
            
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
              style={{ marginBottom: '16px' }}
            >
              <Input.Password
                size="large"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                iconRender={(visible) => visible ? <Eye size={16} /> : <EyeOff size={16} />}
              />
            </Form.Item>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '24px' 
            }}>
              <Checkbox>Keep me signed in</Checkbox>
              <a href="#" style={{ color: '#1890ff', fontSize: '14px', fontWeight: 500 }}>
                Need help?
              </a>
            </div>

            <Button 
              type="primary" 
              htmlType="submit"
              size="large"
              block
              style={{
                height: '48px',
                fontSize: '16px',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                border: 'none'
              }}
            >
              Sign In Securely
            </Button>
          </Form>

          <Divider />
          
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
              Authorized personnel only
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              For technical support, contact your system administrator
            </Text>
          </div>
        </Card>
      </div>
      
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          padding: '12px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.6)'
        }}
      >
        © 2024 Barclays Bank PLC. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
