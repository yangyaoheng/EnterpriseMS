import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

interface Department {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const DepartmentList: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDepartments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '获取部门列表失败');
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/departments', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setShowAddModal(false);
      fetchDepartments();
      setFormData({ name: '', description: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || '添加部门失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!currentDepartment) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/departments/${currentDepartment.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setShowEditModal(false);
      fetchDepartments();
      setCurrentDepartment(null);
    } catch (err: any) {
      setError(err.response?.data?.error || '更新部门失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (department: Department) => {
    setCurrentDepartment(department);
    setFormData({ name: department.name, description: department.description });
    setShowEditModal(true);
  };

  const handleStatusChange = async (department: Department) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = department.status === 'active' ? 'inactive' : 'active';
      await axios.put(`http://localhost:3001/api/departments/${department.id}`, { status: newStatus }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.error || '更新部门状态失败');
    }
  };

  return (
    <div className="container mt-4">
      <h2>部门管理</h2>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          添加部门
        </Button>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>部门名称</th>
            <th>描述</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(department => (
            <tr key={department.id}>
              <td>{department.id}</td>
              <td>{department.name}</td>
              <td>{department.description || '-'}</td>
              <td>
                <span className={`badge ${department.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                  {department.status === 'active' ? '活跃' : '不活跃'}
                </span>
              </td>
              <td>{department.created_at}</td>
              <td>
                <Button variant="info" size="sm" className="me-2" onClick={() => handleEditClick(department)}>
                  编辑
                </Button>
                <Button variant={department.status === 'active' ? 'warning' : 'success'} size="sm" onClick={() => handleStatusChange(department)}>
                  {department.status === 'active' ? '停用' : '启用'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 添加部门模态框 */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>添加部门</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddDepartment}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>部门名称</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>描述</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              取消
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? '添加中...' : '添加'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* 编辑部门模态框 */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>编辑部门</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditDepartment}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>部门名称</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>描述</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              取消
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? '更新中...' : '更新'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentList;