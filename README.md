# 💬 chitthi — Real-Time Full-Stack Chat Application

A full-stack real-time messaging app built with the MERN stack and Socket.io. Users can sign up, chat with anyone on the platform, share images, and see who's online — all happening live with no page refresh needed.

**Live Demo:** [chat-app-nu-sandy.vercel.app](https://chat-app-nu-sandy.vercel.app)

---

## ✨ Features

- **Real-time messaging** via WebSockets — messages appear instantly on both sides
- **Image sharing** — send images in chat; they're uploaded to Cloudinary and persisted
- **Online presence** — green dot indicators show who's currently active
- **Unseen message counts** — badge counters on sidebar contacts for unread messages
- **Profile management** — update name, bio, and profile picture (Cloudinary-backed)
- **JWT authentication** — stateless auth with protected API routes
- **Responsive UI** — works on mobile and desktop with a clean dark glassmorphism aesthetic

---

## 🛠️ Tech Stack

### Backend
| Tech | Role |
|------|------|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Socket.io | Real-time bidirectional communication |
| JWT + bcryptjs | Authentication & password hashing |
| Cloudinary | Cloud image storage for profile pics & chat images |

### Frontend
| Tech | Role |
|------|------|
| React 19 | UI library |
| Vite | Build tool & dev server |
| Tailwind CSS v4 | Styling |
| Socket.io-client | WebSocket client |
| Axios | HTTP requests |
| React Router v7 | Client-side routing |
| React Hot Toast | Toast notifications |

### Deployment
- **Frontend:** Vercel
- **Backend:** Vercel (serverless)
- **Database:** MongoDB Atlas

---

## 🏗️ Architecture

```
chat-app/
├── client/                  # React + Vite frontend
│   ├── context/
│   │   ├── AuthContext.jsx  # Auth state, socket connection, login/logout
│   │   └── ChatContext.jsx  # Messages, users, real-time subscriptions
│   └── src/
│       ├── components/
│       │   ├── ChatContainer.jsx   # Message thread + input
│       │   ├── Sidebar.jsx         # Contact list with unseen counts
│       │   └── RightSidebar.jsx    # Selected user profile info
│       └── pages/
│           ├── HomePage.jsx        # Main chat layout
│           ├── LoginPage.jsx       # Login / Signup toggle
│           └── ProfilePage.jsx     # Profile editor
│
└── server/                  # Express + Socket.io backend
    ├── models/
    │   ├── User.js          # User schema
    │   └── message.js       # Message schema (senderId, receiverId, text, image, seen)
    ├── controllers/
    │   ├── userController.js     # signup, login, updateProfile, checkAuth
    │   └── messageController.js  # getUsers, getMessages, sendMessage, markSeen
    ├── middleware/
    │   └── auth.js          # JWT verification middleware
    └── server.js            # Express app + Socket.io setup
```

---

## ⚡ How Real-Time Works

When a user connects to the app, the frontend opens a Socket.io connection with their `userId` as a query parameter:

```js
const newSocket = io(backendUrl, { query: { userId: userData._id } });
```

On the server, each `userId` maps to a `Set` of socket IDs (to handle multiple tabs):

```js
userSocketMap[userId] = new Set();
userSocketMap[userId].add(socket.id);
```

When a message is sent, the server emits it directly to the receiver's socket(s):

```js
const receiverSocketIds = userSocketMap[receiverId];
receiverSocketIds.forEach(socketId => {
  io.to(socketId).emit("newMessage", newMessage);
});
```

The receiver's client picks this up via `subscribeToMessages()` in `ChatContext` — if the chat with that sender is currently open, the message gets appended and marked seen instantly. If not, the unseen badge counter increments.

Online users are broadcast to everyone on every connect/disconnect:

```js
io.emit("getOnlineUsers", Object.keys(userSocketMap));
```

---

## 🔐 Auth Flow

1. User signs up — password is hashed with `bcryptjs` (salt rounds: 10) before saving to MongoDB
2. On login, a JWT is generated and returned to the client
3. Client stores the token in `localStorage` and attaches it to every Axios request via `axios.defaults.headers.common["token"]`
4. Protected routes on the server verify the token through the `protectRoute` middleware before processing the request

---

## 🖼️ Image Uploads

Images (profile pictures and chat images) are handled by converting files to base64 on the client using `FileReader`, sending them in the request body, and uploading to Cloudinary on the server:

```js
const uploadResponse = await cloudinary.uploader.upload(image);
imageUrl = uploadResponse.secure_url;
```

The returned Cloudinary URL is stored in MongoDB and served directly to clients.

---



## 📌 Key Implementation Decisions

- **Socket.io over polling** — persistent WebSocket connection means zero latency for message delivery; no need to poll the server every N seconds
- **Set-based socket map** — one user can have multiple active tabs; using a `Set` per userId ensures messages reach all of them
- **Context API over Redux** — app state (auth + chat) is scoped to two contexts; Redux would be overkill for this scale
- **Cloudinary for media** — offloads storage and CDN delivery entirely; no multer or local disk needed on the server
- **Seen/unseen at the DB level** — the `seen` boolean on messages is updated server-side on `getMessages`, ensuring read receipts are accurate even across sessions
