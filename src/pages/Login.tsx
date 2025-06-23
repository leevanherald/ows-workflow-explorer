
import React, { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Button, Form, Input, Checkbox, Card, Typography, Space, Flex } from 'antd';

const { Title, Text } = Typography;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (values: any) => {
    console.log('Login attempt:', values);
    // Add login logic here
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #334155 100%)',
        position: 'relative'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.3
        }}
      />
      
      <Card 
        style={{ 
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <div 
              style={{ 
                backgroundColor: 'white', 
                padding: '16px', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                display: 'inline-block',
                marginBottom: '24px'
              }}
            >
              <img 
                src="/lovable-uploads/e99d473b-f728-401b-951d-2fccd7d2a50f.png" 
                alt="Barclays Logo" 
                style={{ height: '64px', width: 'auto' }}
              />
            </div>
            <Title level={2} style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
              OWS Workflow Explorer
            </Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Secure access to your workflow management system
            </Text>
            <Flex align="center" justify="center" gap={8} style={{ marginTop: '8px' }}>
              <Shield size={16} color="#666" />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Enterprise-grade security
              </Text>
            </Flex>
          </div>
          
          <Form 
            layout="vertical" 
            onFinish={handleSubmit}
            style={{ width: '100%' }}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input
                size="large"
                placeholder="Enter your username"
              />
            </Form.Item>
            
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                size="large"
                placeholder="Enter your password"
                iconRender={(visible) => visible ? <Eye size={16} /> : <EyeOff size={16} />}
              />
            </Form.Item>

            <Flex justify="space-between" align="center" style={{ marginBottom: '24px' }}>
              <Checkbox>Keep me signed in</Checkbox>
              <a href="#" style={{ color: '#1890ff', fontSize: '14px', fontWeight: 500 }}>
                Need help?
              </a>
            </Flex>

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

          <div style={{ 
            marginTop: '24px', 
            paddingTop: '16px', 
            borderTop: '1px solid #e0e0e0', 
            textAlign: 'center' 
          }}>
            <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
              Authorized personnel only
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              For technical support, contact your system administrator
            </Text>
          </div>
        </Space>
      </Card>
      
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
