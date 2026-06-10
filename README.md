# 🛡️ SentinelX — Cybersecurity Threat Intelligence Dashboard

> A real-time threat intelligence platform built for security analysts and developers who need live visibility into global cyber threats.

![Tech Stack](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

---

## 🌐 Live Demo

> _Coming soon / [View Screenshots Below](#screenshots)_

---

## 📌 Overview

SentinelX is a full-stack cybersecurity dashboard that aggregates threat data from multiple public APIs and presents it in a clean, cinematic dark UI. It was built to demonstrate real-world application of security concepts and data aggregation in a single platform.

**Five core pages:**

| Page | Description |
|---|---|
| 🏠 Landing | Project intro and quick-start |
| 📊 Dashboard | Live threat feed and severity overview |
| 🗺️ Threat Map | Geographic visualisation of active attacks |
| 🔍 CVE Explorer | Search and browse latest vulnerabilities |
| 📰 Threat News Feed | Aggregated cybersecurity news |

---

## ⚙️ Tech Stack

**Frontend**
- React (component-based UI)
- Dark cinematic UI with neon accents

**Backend**
- Django REST Framework
- SQLite database

**APIs Integrated**
- [NVD (National Vulnerability Database)](https://nvd.nist.gov/) — CVE data
- [AbuseIPDB](https://www.abuseipdb.com/) — Malicious IP reporting
- [NewsAPI](https://newsapi.org/) — Cybersecurity news
- [Shodan](https://www.shodan.io/) — Internet-connected device intelligence

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.10+
- pip

### Installation

```bash
# Clone the repo
git clone https://github.com/fadikod/sentinelx.git
cd sentinelx

# Backend setup
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:3000`

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```
ABUSEIPDB_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
SHODAN_API_KEY=your_key_here
```

> NVD is free and requires no key for basic usage.

---

## 📸 Screenshots


<img width="1903" height="953" alt="image" src="https://github.com/user-attachments/assets/c5edd20a-c41f-489a-8e81-be06837b52e5" />


---

## 💡 What I Learned

- Integrating multiple third-party security APIs into a unified dashboard
- Structuring a Django REST backend to serve a React frontend
- Designing intuitive UI for complex, data-heavy security information
- Handling rate limits and async data fetching across multiple sources

---

## 👤 Author

**Fadi Kodsia**
- 📍 Leiden, Netherlands
- 🎓 BSc Computer Science — Dunaújváros University, Hungary
- 🔗 [LinkedIn](https://www.linkedin.com/in/fadi-kodsia)
- 📧 Available for IT traineeships and junior cybersecurity / data roles

---

## 📄 License

MIT License — feel free to fork and build on it.
