@echo off
echo 启动后端服务器...
start cmd /k "npm start"

echo 等待后端服务器启动...
timeout /t 5 /nobreak > nul

echo 启动前端开发服务器...
cd client
start cmd /k "npm start"

echo 系统已启动，请在浏览器中访问 http://localhost:3000