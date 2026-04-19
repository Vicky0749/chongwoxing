# 宠我行 - 宠物代管平台

> 🐾 基于 LBS 的 C2C 宠物服务平台，连接宠物主和代遛师

## 功能特点

- **用户系统**：手机号注册/登录，宠物主/代遛师角色选择，实名认证
- **宠物管理**：添加/编辑/删除宠物，记录疫苗、性格等信息
- **任务发布**：发布遛狗、上门喂猫等任务，设置悬赏金额
- **任务大厅**：地图/列表浏览附近任务，一键抢单
- **订单管理**：跟踪订单状态（待接单→已接单→进行中→已完成）
- **内置聊天**：基于订单的即时通讯
- **评价系统**：双向评分 + 文字评价

## 技术栈

- 前端：React 18 + Vite + TypeScript + Tailwind CSS
- 后端：Node.js + Express + TypeScript
- 数据库：SQLite（sql.js，纯 JavaScript 实现）
- 地图：支持高德地图 Web API（可选，需申请 Key）

## 快速开始

### 1. 启动后端

```bash
cd server
npm install
npm run dev
```

后端运行在 http://localhost:3001

### 2. 启动前端

```bash
cd client
npm install
npm run dev
```

前端运行在 http://localhost:5173

### 3. 开始使用

1. 打开 http://localhost:5173
2. 注册账号（选择"宠物主"或"代遛师"角色）
3. 宠物主：添加宠物 → 发布任务
4. 代遛师：在任务大厅接单

## 项目结构

```
chongwoxing/
├── client/                 # 前端 React 应用
│   ├── src/
│   │   ├── api/           # API 请求
│   │   ├── components/    # 公共组件
│   │   ├── context/       # React Context
│   │   ├── pages/         # 页面组件
│   │   ├── types/         # TypeScript 类型
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── ...
├── server/                 # 后端 Express 应用
│   ├── src/
│   │   ├── db.ts          # 数据库初始化
│   │   ├── index.ts       # 服务器入口
│   │   └── routes/        # API 路由
│   └── ...
├── data/                   # SQLite 数据库文件（自动创建）
└── README.md
```

## 数据库说明

- 使用 sql.js（纯 JavaScript SQLite），无需安装本地数据库
- 数据库文件自动创建在 `server/data/chongwoxing.db`
- 数据持久化保存，重启服务不丢失

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录 |
| GET | /api/auth/me | 获取当前用户 |
| GET | /api/pets | 获取宠物列表 |
| POST | /api/pets | 添加宠物 |
| GET | /api/tasks | 获取订单列表 |
| POST | /api/tasks | 发布任务 |
| POST | /api/tasks/:id/accept | 接单 |
| POST | /api/tasks/:id/complete | 完成订单 |
| GET | /api/messages/conversations | 对话列表 |
| GET | /api/messages/task/:id | 获取消息 |
| POST | /api/messages | 发送消息 |
| POST | /api/reviews | 发布评价 |

## 注意事项

- 手机号+密码注册，密码明文存储（演示用，请勿用于生产环境）
- 地图功能需申请高德地图 Web API Key
- 支付功能为模拟实现
