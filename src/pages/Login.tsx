
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { Eye, EyeOff, Shield } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" 
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
      
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card className="shadow-lg border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
              <Card.Header className="text-center border-0 bg-transparent pb-4 pt-4">
                <div className="d-flex justify-content-center mb-4">
                  <div className="bg-white p-3 rounded" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                    <img 
                      src="/lovable-uploads/e99d473b-f728-401b-951d-2fccd7d2a50f.png" 
                      alt="Barclays Logo" 
                      style={{ height: '64px', width: 'auto' }}
                    />
                  </div>
                </div>
                <h1 className="h3 fw-bold text-dark mb-2">OWS Workflow Explorer</h1>
                <p className="text-muted">Secure access to your workflow management system</p>
                <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
                  <Shield size={16} className="text-muted" />
                  <small className="text-muted">Enterprise-grade security</small>
                </div>
              </Card.Header>
              
              <Card.Body className="px-4 pb-4">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium text-dark">Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      size="lg"
                      style={{ fontSize: '1.1rem' }}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium text-dark">Password</Form.Label>
                    <InputGroup size="lg">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ fontSize: '1.1rem' }}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ borderLeft: 'none' }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <div className="d-flex align-items-center justify-content-between pt-2 mb-3">
                    <Form.Check 
                      type="checkbox"
                      id="remember"
                      label="Keep me signed in"
                      className="fw-medium"
                    />
                    <a href="#" className="text-decoration-none fw-medium">
                      Need help?
                    </a>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-100 fw-semibold"
                    style={{
                      background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                      border: 'none',
                      fontSize: '1.1rem',
                      transition: 'all 0.2s ease',
                      transform: 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.background = 'linear-gradient(90deg, #1d4ed8 0%, #1e40af 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)';
                    }}
                  >
                    Sign In Securely
                  </Button>
                </Form>

                <hr className="my-4" />
                
                <div className="text-center">
                  <p className="small text-muted mb-2">
                    Authorized personnel only
                  </p>
                  <p className="small text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                    For technical support, contact your system administrator
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <div 
        className="position-absolute bottom-0 start-0 p-3"
        style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}
      >
        © 2024 Barclays Bank PLC. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
