const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// 文件上传配置
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100个请求
});
app.use(limiter);

// 连接数据库
const db = new sqlite3.Database('./enterprise.db', (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('成功连接到SQLite数据库');
  }
});

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// 身份验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的访问令牌' });
    }
    req.user = user;
    next();
  });
};

// 登录API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  db.get('SELECT * FROM user WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库查询失败' });
    }

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    // 记录登录日志
    db.run('INSERT INTO login_log (user_id, ip_address, status) VALUES (?, ?, ?)', [user.id, ip, 'success'], (err) => {
      if (err) {
        console.error('记录登录日志失败:', err.message);
      }
    });

    // 更新用户最后登录时间
    db.run('UPDATE user SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id], (err) => {
      if (err) {
        console.error('更新登录时间失败:', err.message);
      }
    });

    res.json({ 
      message: '登录成功', 
      token, 
      user: { id: user.id, username: user.username, email: user.email }
    });
  });
});

// 注册API
app.post('/api/register', async (req, res) => {
  const { username, password, email, phone } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO user (username, password, email, phone) VALUES (?, ?, ?, ?)', 
      [username, hashedPassword, email, phone], 
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: '用户名或邮箱已存在' });
          }
          return res.status(500).json({ error: '注册失败' });
        }

        res.status(201).json({ message: '注册成功', userId: this.lastID });
      });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取雇员列表API
app.get('/api/employees', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  // 先获取用户角色
  db.get('SELECT r.name FROM user u JOIN user_role ur ON u.id = ur.user_id JOIN role r ON ur.role_id = r.id WHERE u.id = ?', [userId], (err, role) => {
    if (err) {
      return res.status(500).json({ error: '获取角色失败' });
    }

    if (!role) {
      return res.status(403).json({ error: '用户未分配角色' });
    }

    let query;
    let params = [];

    if (role.name === '管理员') {
      query = 'SELECT e.*, u.username, u.email FROM employee e JOIN user u ON e.user_id = u.id';
    } else if (role.name === '部门经理') {
      // 需要获取部门经理所在的部门，然后查询该部门下的雇员
      query = 'SELECT e.*, u.username, u.email FROM employee e JOIN user u ON e.user_id = u.id JOIN employee_department ed ON e.id = ed.employee_id WHERE ed.department_id IN (SELECT ed.department_id FROM employee_department ed JOIN employee e ON ed.employee_id = e.id WHERE e.user_id = ?)';
      params = [userId];
    } else { // 普通雇员
      query = 'SELECT e.*, u.username, u.email FROM employee e JOIN user u ON e.user_id = u.id WHERE e.user_id = ?';
      params = [userId];
    }

    db.all(query, params, (err, employees) => {
      if (err) {
        return res.status(500).json({ error: '查询雇员失败' });
      }
      res.json(employees);
    });
  });
});

// 添加雇员API
app.post('/api/employees', authenticateToken, upload.single('photo'), async (req, res) => {
  const { name, gender, birthday, hire_date, position, salary } = req.body;
  const userId = req.user.userId;
  const photoPath = req.file ? req.file.filename : null;

  // 检查用户权限
  db.get('SELECT r.name FROM user u JOIN user_role ur ON u.id = ur.user_id JOIN role r ON ur.role_id = r.id WHERE u.id = ?', [userId], async (err, role) => {
    if (err) {
      return res.status(500).json({ error: '获取角色失败' });
    }

    if (!role || (role.name !== '管理员' && role.name !== '部门经理')) {
      return res.status(403).json({ error: '无权限添加雇员' });
    }

    // 先创建用户
    const username = name.replace(/\s+/g, '').toLowerCase();
    const password = await bcrypt.hash('123456', 10); // 默认密码

    db.run('INSERT INTO user (username, password) VALUES (?, ?)', 
      [username, password], 
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: '用户名已存在' });
          }
          return res.status(500).json({ error: '创建用户失败' });
        }

        const userId = this.lastID;

        // 创建雇员
        db.run('INSERT INTO employee (user_id, name, gender, birthday, hire_date, position, salary, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
          [userId, name, gender, birthday, hire_date, position, salary, photoPath], 
          function(err) {
            if (err) {
              return res.status(500).json({ error: '创建雇员失败' });
            }

            res.status(201).json({ message: '雇员添加成功', employeeId: this.lastID });
          });
      });
  });
});

// 静态文件服务
app.use('/uploads', express.static(uploadDir));

// 更新雇员API
app.put('/api/employees/:id', authenticateToken, upload.single('photo'), async (req, res) => {
  const { id } = req.params;
  const { name, gender, birthday, hire_date, position, salary, status } = req.body;
  const userId = req.user.userId;
  const photoPath = req.file ? req.file.filename : null;

  // 检查用户权限
  db.get('SELECT r.name FROM user u JOIN user_role ur ON u.id = ur.user_id JOIN role r ON ur.role_id = r.id WHERE u.id = ?', [userId], async (err, role) => {
    if (err) {
      return res.status(500).json({ error: '获取角色失败' });
    }

    if (!role || (role.name !== '管理员' && role.name !== '部门经理')) {
      return res.status(403).json({ error: '无权限更新雇员' });
    }

    // 获取当前雇员信息
    db.get('SELECT * FROM employee WHERE id = ?', [id], (err, currentEmployee) => {
      if (err) {
        return res.status(500).json({ error: '获取雇员信息失败' });
      }

      if (!currentEmployee) {
        return res.status(404).json({ error: '雇员不存在' });
      }

      // 构建更新SQL
      const updateFields = [];
      const updateValues = [];

      if (name) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      if (gender) {
        updateFields.push('gender = ?');
        updateValues.push(gender);
      }
      if (birthday) {
        updateFields.push('birthday = ?');
        updateValues.push(birthday);
      }
      if (hire_date) {
        updateFields.push('hire_date = ?');
        updateValues.push(hire_date);
      }
      if (position) {
        updateFields.push('position = ?');
        updateValues.push(position);
      }
      if (salary) {
        updateFields.push('salary = ?');
        updateValues.push(salary);
      }
      if (status) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }
      if (photoPath) {
        updateFields.push('photo = ?');
        updateValues.push(photoPath);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: '没有需要更新的字段' });
      }

      updateValues.push(id);

      const sql = `UPDATE employee SET ${updateFields.join(', ')} WHERE id = ?`;

      db.run(sql, updateValues, function(err) {
        if (err) {
          return res.status(500).json({ error: '更新雇员失败' });
        }

        res.status(200).json({ message: '雇员更新成功' });
      });
    });
  });
});

// 获取部门列表API
app.get('/api/departments', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  // 先获取用户角色
  db.get('SELECT r.name FROM user u JOIN user_role ur ON u.id = ur.user_id JOIN role r ON ur.role_id = r.id WHERE u.id = ?', [userId], (err, role) => {
    if (err) {
      return res.status(500).json({ error: '获取角色失败' });
    }

    if (!role) {
      return res.status(403).json({ error: '用户未分配角色' });
    }

    // 所有角色都可以查看部门列表
    db.all('SELECT * FROM department WHERE status = ?', ['active'], (err, departments) => {
      if (err) {
        return res.status(500).json({ error: '查询部门失败' });
      }
      res.json(departments);
    });
  });
});

// 添加部门API
app.post('/api/departments', authenticateToken, (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.userId;

  // 先获取用户角色
  db.get('SELECT r.name FROM user u JOIN user_role ur ON u.id = ur.user_id JOIN role r ON ur.role_id = r.id WHERE u.id = ?', [userId], (err, role) => {
    if (err) {
      return res.status(500).json({ error: '获取角色失败' });
    }

    if (!role || role.name !== '管理员') {
      return res.status(403).json({ error: '只有管理员可以添加部门' });
    }

    if (!name) {
      return res.status(400).json({ error: '部门名称不能为空' });
    }

    db.run('INSERT INTO department (name, description) VALUES (?, ?)', [name, description], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: '部门名称已存在' });
        }
        return res.status(500).json({ error: '添加部门失败' });
      }

      res.status(201).json({ message: '部门添加成功', departmentId: this.lastID });
    });
  });
});

// 更新部门API
app.put('/api/departments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;
  const userId = req.user.userId;

  // 先获取用户角色
  db.get('SELECT r.name FROM user u JOIN user_role ur ON u.id = ur.user_id JOIN role r ON ur.role_id = r.id WHERE u.id = ?', [userId], (err, role) => {
    if (err) {
      return res.status(500).json({ error: '获取角色失败' });
    }

    if (!role || role.name !== '管理员') {
      return res.status(403).json({ error: '只有管理员可以更新部门' });
    }

    // 构建更新SQL
    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    updateValues.push(id);

    const sql = `UPDATE department SET ${updateFields.join(', ')} WHERE id = ?`;

    db.run(sql, updateValues, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: '部门名称已存在' });
        }
        return res.status(500).json({ error: '更新部门失败' });
      }

      res.status(200).json({ message: '部门更新成功' });
    });
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 导出数据库连接
module.exports = db;