# TrashTrack 🚀

TrashTrack is a modern web application built to empower citizens to report unclean areas with image proof and enable city officials to track, verify, and resolve these issues with visual confirmation.
No more dirty streets slipping under the radar—report filth, get it fixed, and see the change happen 💥

- ✅ Citizens submit real-time reports with images
- 🧹 Officers resolve them with cleanup proof
- 📊 Officer dashboard with insights & stats
- ⚡ Clean interface. Fast reporting. Real impact.

---

## 🔥 Features

- 👥 JWT-based User Authentication
- 🧾 Citizen Report Submission with Image Proof
- 🧹 Officer Panel to Resolve Reports with Cleanup Images
- 📊 Insights Dashboard with Statistics & Trends
- 🗂️ Role-based Dashboards (Citizen / Officer)
- 🗺️ Track and View Resolved Reports
- 📷 Image Validation & Uploads (Cloudinary)
- 🔐 Secure API Routes with Middleware Guards
- 📱 Fully Responsive UI for All Devices
- 🔄 Auto Token Validation & Auth State Persistence

---

## 🛠️ Tech Stack

- **Framework** : Next.js 15 (App Router)
- **Styling** : TailwindCSS
- **Backend Runtime** : Serverless Functions (Vercel Edge)
- **Database** : MongoDB Atlas
- **ODM** : Mongoose
- **Authentication** : JWT + Middleware Guards
- **Image Storage** : Cloudinary
- **State Management** : React Context API
- **Notifications** : React-Toastify
- **Deployment** : Vercel

---

## 📂 Project Structure

```plaintext
/trashtrack
├── app/
├── assets/
├── components/
├── context/
├── lib/
├── .gitignore
├── eslint.config.mjs
├── jsconfig.json
├── middleware.js
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
└── README.md
```

---

## ⚙️ Setup Instructions

1. **Clone the repository**
```
git clone https://github.com/Hiren-Sarvaiya/TrashTrack46.git
cd TrashTrack46
```

2. **Setup Project**
```
npm install
npm run dev
```

3. **Environment Variables**
```
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=vAh8-your_cloudinary_api_secret
```

---

## ✨ Developer

- Hiren Sarvaiya

---

## 🚀 Deployed Applications

**Next JS App** : Deployed on [Vercel](https://vercel.com)  
🔗 https://trash-track.vercel.app

**Database** : Hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---