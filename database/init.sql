-- 创建用户表
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建角色表
CREATE TABLE IF NOT EXISTS role (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建权限表
CREATE TABLE IF NOT EXISTS permission (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建部门表
CREATE TABLE IF NOT EXISTS department (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建雇员表
CREATE TABLE IF NOT EXISTS employee (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    gender TEXT,
    birthday DATE,
    hire_date DATE,
    position TEXT,
    salary DECIMAL(10,2),
    photo TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 创建用户角色关联表
CREATE TABLE IF NOT EXISTS user_role (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (role_id) REFERENCES role(id)
);

-- 创建角色权限关联表
CREATE TABLE IF NOT EXISTS role_permission (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (permission_id) REFERENCES permission(id)
);

-- 创建雇员部门关联表
CREATE TABLE IF NOT EXISTS employee_department (
    employee_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    PRIMARY KEY (employee_id, department_id),
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (department_id) REFERENCES department(id)
);

-- 创建雇员角色关联表
CREATE TABLE IF NOT EXISTS employee_role (
    employee_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (employee_id, role_id),
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (role_id) REFERENCES role(id)
);

-- 创建雇员权限关联表
CREATE TABLE IF NOT EXISTS employee_permission (
    employee_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (employee_id, permission_id),
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (permission_id) REFERENCES permission(id)
);

-- 创建登录日志表
CREATE TABLE IF NOT EXISTS login_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    status TEXT,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 创建操作日志表
CREATE TABLE IF NOT EXISTS operation_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    operation_type TEXT,
    operation_content TEXT,
    ip_address TEXT,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 插入初始角色
INSERT OR IGNORE INTO role (name, description) VALUES 
('管理员', '系统管理员，拥有所有权限'),
('雇员', '普通雇员，只能查看和修改自己的信息'),
('部门经理', '部门经理，能管理部门下的所有雇员');

-- 插入初始权限
INSERT OR IGNORE INTO permission (name, description) VALUES 
('view_employee', '查看雇员信息'),
('add_employee', '添加雇员'),
('edit_employee', '编辑雇员'),
('delete_employee', '删除雇员'),
('view_department', '查看部门信息'),
('manage_department', '管理部门');

-- 为管理员分配所有权限
INSERT OR IGNORE INTO role_permission (role_id, permission_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6);

-- 为部门经理分配部门管理权限
INSERT OR IGNORE INTO role_permission (role_id, permission_id) VALUES 
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5);

-- 为雇员分配查看自己信息的权限
INSERT OR IGNORE INTO role_permission (role_id, permission_id) VALUES 
(2, 1);