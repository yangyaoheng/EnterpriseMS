const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// 读取SQL文件
const sql = fs.readFileSync('./database/init.sql', 'utf8');

// 创建数据库连接
const db = new sqlite3.Database('./enterprise.db', (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
    process.exit(1);
  }
  console.log('成功连接到SQLite数据库');
});

// 执行SQL脚本
db.exec(sql, (err) => {
  if (err) {
    console.error('执行SQL脚本失败:', err.message);
    db.close();
    process.exit(1);
  }
  console.log('数据库初始化成功');
  db.close();
});