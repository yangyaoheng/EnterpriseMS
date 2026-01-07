import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { employeeService } from '../services/api';

interface AddEmployeeModalProps {
  show: boolean;
  onHide: () => void;
  onEmployeeAdded: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ show, onHide, onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthday: '',
    hire_date: '',
    position: '',
    salary: '',
    photo: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('gender', formData.gender);
      form.append('birthday', formData.birthday);
      form.append('hire_date', formData.hire_date);
      form.append('position', formData.position);
      form.append('salary', formData.salary);
      if (formData.photo) {
        form.append('photo', formData.photo);
      }

      await employeeService.addEmployee(form);
      onHide();
      onEmployeeAdded();
      // 重置表单
      setFormData({
        name: '',
        gender: '',
        birthday: '',
        hire_date: '',
        position: '',
        salary: '',
        photo: null
      });
    } catch (err: any) {
      setError(err.response?.data?.error || '添加雇员失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>添加雇员</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>姓名</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formGender">
            <Form.Label>性别</Form.Label>
            <Form.Control
              type="text"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              placeholder="男/女"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBirthday">
            <Form.Label>生日</Form.Label>
            <Form.Control
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formHireDate">
            <Form.Label>入职日期</Form.Label>
            <Form.Control
              type="date"
              name="hire_date"
              value={formData.hire_date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPosition">
            <Form.Label>职位</Form.Label>
            <Form.Control
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formSalary">
            <Form.Label>薪资</Form.Label>
            <Form.Control
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              step="0.01"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPhoto">
            <Form.Label>照片</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading} className="w-100">
            {loading ? '添加中...' : '添加雇员'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddEmployeeModal;