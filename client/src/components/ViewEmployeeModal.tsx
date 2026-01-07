import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import { Employee } from '../types';

interface ViewEmployeeModalProps {
  show: boolean;
  onHide: () => void;
  employee: Employee | null;
}

const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({ show, onHide, employee }) => {
  if (!employee) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>查看雇员信息</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover>
          <tbody>
            <tr>
              <td><strong>ID</strong></td>
              <td>{employee.id}</td>
            </tr>
            <tr>
              <td><strong>姓名</strong></td>
              <td>{employee.name}</td>
            </tr>
            <tr>
              <td><strong>用户名</strong></td>
              <td>{employee.username}</td>
            </tr>
            <tr>
              <td><strong>性别</strong></td>
              <td>{employee.gender || '-'}</td>
            </tr>
            <tr>
              <td><strong>生日</strong></td>
              <td>{employee.birthday || '-'}</td>
            </tr>
            <tr>
              <td><strong>入职日期</strong></td>
              <td>{employee.hire_date || '-'}</td>
            </tr>
            <tr>
              <td><strong>职位</strong></td>
              <td>{employee.position || '-'}</td>
            </tr>
            <tr>
              <td><strong>薪资</strong></td>
              <td>{employee.salary ? `¥${employee.salary}` : '-'}</td>
            </tr>
            <tr>
              <td><strong>状态</strong></td>
              <td>{employee.status}</td>
            </tr>
            <tr>
              <td><strong>创建时间</strong></td>
              <td>{employee.created_at}</td>
            </tr>
            <tr>
              <td><strong>更新时间</strong></td>
              <td>{employee.updated_at}</td>
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          关闭
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewEmployeeModal;