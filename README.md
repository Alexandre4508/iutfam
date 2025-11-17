# 🎓 IUTFAM – Plateforme Étudiante de l'IUT de La Réunion

IUTFAM est une plateforme web moderne développée pour les étudiants de l’IUT de La Réunion (site de Saint-Pierre).  
Elle permet :

- 💬 Discussions (général, groupes, chats privés)
- 👥 Gestion des classes & profils
- 📅 Création d’événements
- 📢 Annonces & tableau d’affichage
- 🍽 Accès aux menus du RU
- 🗂 Ancienne interface “Legacy” (compatibilité)

Le projet est construit avec un environnement **Next.js + NestJS + PostgreSQL** entièrement automatisé via **Docker Compose**.

# 📦 **Technologies principales**

| Composant | Technologie |
|----------|-------------|
| Frontend | **Next.js 14**, React, Tailwind |
| Backend | **NestJS**, Prisma, TypeScript |


| Base SQL | **PostgreSQL 15** |
| API Auth | JWT |
| Notifications | WebSockets (Socket.io) |
| Infra | Docker Compose v2 |

# 🚀 **1. Installation (Windows / Linux / macOS)**

## 🔧 1.1 Pré-requis

Installer :

### **Windows**
- Docker Desktop  
- Git for Windows  
- (Optionnel) WSL2


### **Linux (Ubuntu / Debian)**
```bash
sudo apt update
sudo apt install -y git docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker


