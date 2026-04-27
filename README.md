# IdealClean - E-Commerce Platform

Platformă e-commerce pentru produse de curățenie profesionale.

## Structura Proiectului

```
Site-IdealClean/
├── frontend/          # React + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/   # Navbar, Footer, Toast
│   │   ├── pages/        # Landing, ProductPage, Checkout, Dashboard
│   │   ├── store.js      # Data layer (localStorage)
│   │   ├── App.jsx       # Router config
│   │   └── index.css     # Design system premium
│   ├── public/           # Logo, assets
│   └── package.json
├── backend/           # Node.js + Express (în dezvoltare)
│   ├── src/
│   │   └── server.js     # Entry point
│   └── package.json
└── README.md
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Site-ul va fi disponibil la `http://localhost:5173`

### Backend (în dezvoltare)
```bash
cd backend
npm install
npm run dev
```
API-ul va rula pe `http://localhost:5000`
