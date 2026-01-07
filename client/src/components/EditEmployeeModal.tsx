import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Employee } from '../types';
import { employeeService } from '../services/api';

interface EditEmployeeModalProps {
  show: boolean;
  onHide: () => void;
  employee: Employee | null;
  onEmployeeUpdated: () => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ show, onHide, employee, onEmployeeUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthday: '',
    hireDate: '',
    position: '',
    salary: '',
    photo: '',
    status: 'active',
    file: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        gender: employee.gender || '',
        birthday: employee.birthday || '',
        hireDate: employee.hire_date || '',
        position: employee.position || '',
        salary: employee.salary ? employee.salary.toString() : '',
        photo: employee.photo ? `http://localhost:3001/uploads/${employee.photo}` : '',
        status: employee.status || 'active',
        file: null
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!employee) return;

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('gender', formData.gender);
      form.append('birthday', formData.birthday);
      form.append('hire_date', formData.hireDate);
      form.append('position', formData.position);
      form.append('salary', formData.salary);
      form.append('status', formData.status);
      if (formData.file) {
        form.append('photo', formData.file);
      }

      await employeeService.updateEmployee(employee.id, form);
      onHide();
      onEmployeeUpdated();
      // 重置表单
      setFormData({
        name: '',
        gender: '',
        birthday: '',
        hireDate: '',
        position: '',
        salary: '',
        photo: '',
        status: 'active',
        file: null
      });
    } catch (err: any) {
      setError(err.response?.data?.error || '更新雇员失败');
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>编辑雇员信息</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>姓名</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formGender">
            <Form.Label>性别</Form.Label>
            <Form.Select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">请选择</option>
              <option value="male">男</option>
              <option value="female">女</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBirthday">
            <Form.Label>生日</Form.Label>
            <Form.Control
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formHireDate">
            <Form.Label>入职日期</Form.Label>
            <Form.Control
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPosition">
            <Form.Label>职位</Form.Label>
            <Form.Control
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formSalary">
            <Form.Label>薪资</Form.Label>
            <Form.Control
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              min="0"
              step="0.01"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPhoto">
            <Form.Label>照片</Form.Label>
            <div className="mb-2">
              {formData.photo && (
                <img 
                  src={formData.photo} 
                  alt="雇员照片" 
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
                />
              )}
            </div>
            <div className="d-flex gap-2">
              <Form.Control
                type="url"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="flex-grow-1"
              />
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const input = e.target as HTMLInputElement;
                  const file = input.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64 = event.target?.result as string;
                      setFormData({ ...formData, photo: base64, file: file });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formStatus">
            <Form.Label>状态</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">在职</option>
              <option value="inactive">离职</option>
            </Form.Select>
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? '更新中...' : '更新雇员'}
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          取消
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditEmployeeModal;