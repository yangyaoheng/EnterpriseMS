import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { employeeService } from '../services/api';

const Dashboard: React.FC = () => {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const employees = await employeeService.getEmployees();
      setEmployeeCount(employees.length);
      setActiveEmployees(employees.filter(e => e.status === 'active').length);
    } catch (err: any) {
      setError(err.response?.data?.error || '获取仪表盘数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">加载中...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4">仪表盘</h2>
      <Row className="g-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title className="text-primary">总雇员数</Card.Title>
              <Card.Text className="display-4">{employeeCount}</Card.Text>
              <Card.Text className="text-muted">系统中所有雇员</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title className="text-success">在职雇员</Card.Title>
              <Card.Text className="display-4">{activeEmployees}</Card.Text>
              <Card.Text className="text-muted">当前在职的雇员</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title className="text-warning">离职雇员</Card.Title>
              <Card.Text className="display-4">{employeeCount - activeEmployees}</Card.Text>
              <Card.Text className="text-muted">已离职的雇员</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>系统概览</Card.Header>
            <Card.Body>
              <p className="mb-2">欢迎使用企业信息管理系统</p>
              <p className="mb-2">本系统用于管理企业雇员信息，支持添加、编辑、查看和删除雇员</p>
              <p className="mb-2">根据角色权限不同，可执行不同的操作</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;