# 企业信息管理系统

这是一套BS结构的企业信息管理系统，采用前后端分离架构。

## 技术栈

### 后端
- Node.js
- Express.js
- SQLite3
- JWT 身份验证
- bcryptjs 密码加密

### 前端
- React 18
- TypeScript
- React Bootstrap
- React Router
- Axios

## 功能模块

### 登录模块
1. 用户登录系统
2. 用户注册
3. 用户注销
4. 角色权限管理（管理员、雇员、部门经理）
5. 登录日志记录
6. 操作日志记录

### 雇员管理模块
1. 雇员信息查看（按角色权限）
2. 雇员信息添加
3. 雇员信息编辑
4. 雇员信息删除

## 数据库结构

系统包含以下主要数据表：
- user: 用户表
- role: 角色表
- permission: 权限表
- department: 部门表
- employee: 雇员表
- user_role: 用户角色关联表
- role_permission: 角色权限关联表
- employee_department: 雇员部门关联表
- login_log: 登录日志表
- operation_log: 操作日志表

## 安装与运行

### 1. 安装依赖
```bash
npm install
cd client
npm install
```

### 2. 初始化数据库
```bash
# 确保已安装 sqlite3 命令行工具
sqlite3 enterprise.db < database/init.sql
```

### 3. 启动系统

#### 方式一：使用批处理文件
```bash
start.bat
```

#### 方式二：手动启动
```bash
# 启动后端服务器（端口 3001）
npm start

# 启动前端开发服务器（端口 3000）
cd client
npm start
```

### 4. 访问系统
打开浏览器访问：http://localhost:3000

## 角色权限说明

### 管理员
- 可以查看所有雇员信息
- 可以添加、编辑、删除雇员信息

### 部门经理
- 可以查看所在部门的所有雇员信息
- 可以添加、编辑、删除所在部门的雇员信息

### 雇员
- 只能查看自己的信息
- 只能修改自己的信息

## API 接口

### 认证接口
- POST /api/login: 用户登录
- POST /api/register: 用户注册

### 雇员接口
- GET /api/employees: 获取雇员列表
- POST /api/employees: 添加雇员

## 开发说明

### 环境变量
可以在根目录创建 `.env` 文件配置环境变量：
```env
JWT_SECRET=your-secret-key-here
```

### 代码结构
```
├── database/          # 数据库初始化脚本
├── client/            # 前端 React 应用
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── services/    # API 服务
│   │   └── types/       # TypeScript 类型定义
├── server.js          # 后端服务器入口
├── package.json       # 后端依赖
└── .gitignore        # Git 忽略文件
```

## 注意事项

1. 首次运行需要初始化数据库
2. 确保 Node.js 版本 >= 14.0.0
3. 前端开发服务器默认端口 3000，后端 API 端口 3001
4. 生产环境需要修改 JWT_SECRET 为安全的密钥

## 许可证

MIT License