# 📝 Todo List - Full Stack Application

![CI/CD](https://github.com/Kelwinpin/todo/workflows/CI/CD%20Pipeline/badge.svg)
![PR Check](https://github.com/Kelwinpin/todo/workflows/PR%20Quality%20Check/badge.svg)
![Security](https://github.com/Kelwinpin/todo/workflows/Security%20&%20Dependency%20Scan/badge.svg)

Uma aplicação completa de gerenciamento de tarefas (Todo List) desenvolvida com tecnologias modernas, featuring autenticação, prioridades, e uma interface elegante.

## 🚀 Funcionalidades

### ✨ **Core Features**
- 📋 **CRUD completo de tarefas** - Criar, listar, editar, excluir e marcar como concluída
- 🔐 **Sistema de autenticação** - Login/cadastro com JWT
- ⚡ **Prioridades de tarefas** - Baixa, Média, Alta
- 📅 **DatePicker customizado** - Seleção visual de datas
- 🎨 **Interface moderna** - Design responsivo com tema escuro/gradiente
- 📱 **Responsivo** - Funciona perfeitamente em mobile e desktop

### 🛠️ **Funcionalidades Técnicas**
- 🔄 **Loading states** - Componentes e hooks customizados
- 🍞 **Toast notifications** - Sistema unificado de notificações
- 📊 **Skeleton loading** - Estados de carregamento elegantes
- ✅ **Validações** - React Hook Form com validações client-side
- 🎯 **TypeScript** - Tipagem completa em frontend e backend
- 🧪 **Testes automatizados** - Unit tests e E2E tests
- 🔄 **CI/CD Pipeline** - GitHub Actions para deploy automático

## 🏗️ Arquitetura do Projeto

```
todoList/
├── todo/                      # 📁 Projeto principal
│   ├── frontend/              # 🎨 Next.js + React
│   │   ├── src/
│   │   │   ├── app/           # 📄 Pages (App Router)
│   │   │   │   ├── page.tsx           # 🔐 Login
│   │   │   │   ├── signup/            # ✍️ Cadastro  
│   │   │   │   └── todo/              # 📋 Dashboard de tarefas
│   │   │   ├── components/    # 🧩 Componentes reutilizáveis
│   │   │   │   ├── ui/                # 🎨 Componentes base
│   │   │   │   └── datePicker.tsx     # 📅 DatePicker customizado
│   │   │   ├── hooks/         # 🎣 Custom hooks
│   │   │   │   ├── useLoading.tsx     # ⚡ Estado de loading
│   │   │   │   └── useToast.tsx       # 🍞 Notificações
│   │   │   ├── services/      # 🌐 API services
│   │   │   └── lib/           # 🔧 Utilitários
│   │   └── package.json
│   ├── backend/               # ⚙️ NestJS + Prisma
│   │   ├── src/
│   │   │   ├── auth/          # 🔐 Autenticação JWT
│   │   │   ├── tasks/         # 📋 CRUD de tarefas
│   │   │   ├── priority/      # ⚡ Gerenciamento de prioridades
│   │   │   ├── users/         # 👥 Gerenciamento de usuários
│   │   │   └── prisma/        # 🗄️ Database service
│   │   ├── prisma/            # 📊 Schema do banco
│   │   ├── test/              # 🧪 Testes E2E
│   │   └── package.json
│   └── .github/               # 🤖 CI/CD Workflows
│       └── workflows/
│           ├── ci.yml         # 🚀 Pipeline principal
│           ├── pr-check.yml   # ✅ Check de PRs
│           └── security.yml   # 🛡️ Análise de segurança
└── README.md                  # 📖 Esta documentação
```

## 🛠️ Stack Tecnológica

### **Frontend**
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Next.js** | 15.4.5 | Framework React com App Router |
| **React** | 19.1.0 | Biblioteca de UI |
| **TypeScript** | 5.x | Tipagem estática |
| **Tailwind CSS** | 4.x | Framework de CSS utilitário |
| **React Hook Form** | 7.61.1 | Gerenciamento de formulários |
| **Date-fns** | 4.1.0 | Manipulação de datas |
| **Lucide React** | 0.534.0 | Ícones modernos |
| **Sonner** | 2.0.7 | Toast notifications |
| **Radix UI** | - | Componentes acessíveis |

### **Backend**
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **NestJS** | 11.x | Framework Node.js |
| **Prisma** | 6.13.0 | ORM moderno |
| **PostgreSQL** | 15+ | Banco de dados |
| **JWT** | 11.x | Autenticação |
| **Bcrypt** | 6.x | Hash de senhas |
| **Jest** | 30.x | Framework de testes |
| **Passport** | 0.7.0 | Estratégias de auth |

### **DevOps & Tools**
| Ferramenta | Descrição |
|------------|-----------|
| **GitHub Actions** | CI/CD Pipeline |
| **ESLint** | Linting de código |
| **Prettier** | Formatação de código |
| **Docker** | Containerização (ready) |
| **CodeQL** | Análise de segurança |

## 🚀 Como Executar

### **Pré-requisitos**
- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### **1. Clonar o repositório**
```bash
git clone https://github.com/Kelwinpin/todo.git
cd todoList/todo
```

### **2. Configurar Backend**
```bash
cd backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Configurar banco de dados
npx prisma generate
npx prisma db push

# Executar
npm run start:dev
```

### **3. Configurar Frontend**
```bash
cd ../frontend
npm install

# Executar
npm run dev
```

### **4. Acessar a aplicação**
- **Frontend:** http://localhost:3001
- **Backend:** http://localhost:3000
- **API Docs:** http://localhost:3000/api (se configurado)

## 🧪 Testes

### **Backend**
```bash
cd backend

# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

### **Frontend**
```bash
cd frontend

# Lint
npm run lint

# Build
npm run build
```

## 🔧 Scripts Disponíveis

### **Frontend**
```bash
npm run dev        # Desenvolvimento
npm run build      # Build de produção
npm run start      # Servir build
npm run lint       # ESLint
```

### **Backend**
```bash
npm run start:dev  # Desenvolvimento
npm run build      # Build
npm run start:prod # Produção
npm run test       # Testes unitários
npm run test:e2e   # Testes E2E
npm run lint       # ESLint
```

## 🎨 Features em Destaque

### **🎭 Interface Moderna**
- Design gradiente roxo/rosa
- Componentes glassmorphism
- Animações suaves
- Loading states elegantes

### **📱 Responsividade**
- Mobile-first design
- Breakpoints otimizados
- Touch-friendly

### **⚡ Performance**
- Server-side rendering (Next.js)
- Code splitting automático
- Lazy loading de componentes
- Otimização de imagens

### **🔒 Segurança**
- JWT tokens seguros
- Hash bcrypt para senhas  
- Validações client e server-side
- Sanitização de dados

## 🚀 Deploy

### **Automático (CI/CD)**
```bash
# Push para branch main
git push origin main
# Pipeline automático será executado
```

### **Manual**
```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd ../backend && npm run build

# Deploy os arquivos das pastas:
# - frontend/.next
# - backend/dist
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Padrões de Commit**
```bash
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de build/ci
```

## 📊 Status do Projeto

- ✅ **Backend API** - Completamente funcional
- ✅ **Frontend UI** - Interface moderna implementada
- ✅ **Autenticação** - JWT funcionando
- ✅ **CRUD Tarefas** - Todas operações implementadas
- ✅ **CI/CD Pipeline** - GitHub Actions configurado
- ✅ **Testes** - Cobertura básica implementada
- 🔄 **Deploy** - Em configuração
- 📋 **Documentação** - Em progresso

## 📸 Screenshots

> *Screenshots serão adicionados em breve*

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Kelwin Pin**
- GitHub: [@Kelwinpin](https://github.com/Kelwinpin)
- LinkedIn: [Seu LinkedIn](https://linkedin.com/in/seu-perfil)

---

⭐ **Se este projeto te ajudou, deixe uma estrela!** ⭐
