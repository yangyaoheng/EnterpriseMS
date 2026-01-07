import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Card, Alert, Spinner } from 'react-bootstrap';
import { employeeService } from '../services/api';
import { Employee } from '../types';
import AddEmployeeModal from './AddEmployeeModal';
import ViewEmployeeModal from './ViewEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      setError(err.response?.data?.error || '获取雇员列表失败');
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

  const employeeList = (
    <Container className="mt-5">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>雇员管理</h2>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>添加雇员</Button>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>姓名</th>
                <th>用户名</th>
                <th>性别</th>
                <th>生日</th>
                <th>入职日期</th>
                <th>职位</th>
                <th>薪资</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.username}</td>
                  <td>{employee.gender || '-'}</td>
                  <td>{employee.birthday || '-'}</td>
                  <td>{employee.hire_date || '-'}</td>
                  <td>{employee.position || '-'}</td>
                  <td>{employee.salary ? `¥${employee.salary}` : '-'}</td>
                  <td>{employee.status}</td>
                  <td>
                    <Button variant="info" size="sm" className="me-2" onClick={() => {
                      setSelectedEmployee(employee);
                      setShowViewModal(true);
                    }}>查看</Button>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => {
                      setSelectedEmployee(employee);
                      setShowEditModal(true);
                    }}>编辑</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );

  return (
    <>
      {employeeList}
      <AddEmployeeModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onEmployeeAdded={fetchEmployees}
      />
      <ViewEmployeeModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        employee={selectedEmployee}
      />
      <EditEmployeeModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        employee={selectedEmployee}
        onEmployeeUpdated={fetchEmployees}
      />
    </>
  );
};

export default EmployeeList;