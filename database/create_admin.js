const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

// 连接数据库
const db = new sqlite3.Database('./enterprise.db', (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
    process.exit(1);
  }
  console.log('成功连接到SQLite数据库');
});

// 创建管理员账户
const createAdmin = async () => {
  try {
    const username = 'admin';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 插入管理员用户
    db.run('INSERT OR IGNORE INTO user (username, password, email) VALUES (?, ?, ?)', 
      [username, hashedPassword, 'admin@example.com'], 
      function(err) {
        if (err) {
          console.error('创建管理员失败:', err.message);
          return;
        }

        if (this.changes > 0) {
          console.log('管理员账户创建成功');
          
          // 分配管理员角色
          db.run('INSERT OR IGNORE INTO user_role (user_id, role_id) VALUES ((SELECT id FROM user WHERE username = ?), 1)', 
            [username], 
            function(err) {
              if (err) {
                console.error('分配角色失败:', err.message);
                return;
              }
              console.log('管理员角色分配成功');
              db.close();
            });
        } else {
          console.log('管理员账户已存在');
          db.close();
        }
      });
  } catch (err) {
    console.error('创建管理员失败:', err.message);
    db.close();
  }
};

createAdmin();