import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { authService } from '../services/api';

const NavigationBar: React.FC = () => {
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">企业信息管理系统</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isLoggedIn && (
              <>
                <Nav.Link href="/">仪表盘</Nav.Link>
                <Nav.Link href="/employees">雇员管理</Nav.Link>
                <Nav.Link href="/departments">部门管理</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isLoggedIn ? (
              <Button variant="outline-light" onClick={handleLogout}>注销</Button>
            ) : (
              <>
                <Nav.Link href="/login">登录</Nav.Link>
                <Nav.Link href="/register">注册</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;