# GitHub Workflows

Este diretório contém os workflows do GitHub Actions para CI/CD do projeto Todo.

## Workflows Disponíveis

### 1. `ci.yml` - Pipeline Principal de CI/CD

**Triggers:** Push e Pull Request nas branches `main` e `develop`

**Jobs:**
- **Frontend CI:**
  - ✅ Instala dependências
  - ✅ Executa ESLint
  - ✅ Verifica TypeScript
  - ✅ Executa build
  - ✅ Upload de artefatos

- **Backend CI:**
  - ✅ Configura PostgreSQL para testes
  - ✅ Instala dependências
  - ✅ Executa ESLint
  - ✅ Verifica TypeScript
  - ✅ Configura banco de dados de teste
  - ✅ Executa testes unitários
  - ✅ Executa testes e2e
  - ✅ Gera relatório de cobertura
  - ✅ Executa build
  - ✅ Upload de artefatos

- **Security Scan:**
  - ✅ Auditoria de segurança (frontend)
  - ✅ Auditoria de segurança (backend)

- **Deploy:**
  - ✅ Deploy automático (apenas branch main)
  - ✅ Download de artefatos
  - ✅ Preparação para deployment

- **Notify:**
  - ✅ Notificações de sucesso/falha

### 2. `pr-check.yml` - Verificação Rápida para PRs

**Triggers:** Pull Requests (opened, synchronize, reopened)

**Jobs:**
- **Lint and Build:**
  - ⚡ Verificação rápida de qualidade
  - ⚡ Lint frontend e backend
  - ⚡ TypeScript check
  - ⚡ Build verification

### 3. `security.yml` - Análise de Segurança

**Triggers:** 
- Agendamento (toda segunda-feira às 9h UTC)
- Execução manual

**Jobs:**
- **Dependency Scan:**
  - 🔍 Análise de vulnerabilidades
  - 📦 Verificação de pacotes desatualizados

- **CodeQL Analysis:**
  - 🛡️ Análise estática de código
  - 🔒 Detecção de vulnerabilidades de segurança

## Variáveis de Ambiente Necessárias

### Para o Backend (testes):
```bash
DATABASE_URL=postgresql://test:test@localhost:5432/todotest
JWT_SECRET=test-secret-key
```

### Para Deploy (configurar nos Secrets do GitHub):
```bash
# Adicione suas variáveis de deploy aqui
DEPLOY_HOST=your-server.com
DEPLOY_USER=deploy-user
DEPLOY_KEY=ssh-private-key
```

## Como Usar

### 1. Para desenvolvimento:
- Crie um PR para `develop` ou `main`
- O workflow `pr-check.yml` será executado automaticamente
- Corrija qualquer erro antes do merge

### 2. Para deploy:
- Faça push para a branch `main`
- O workflow completo `ci.yml` será executado
- Deploy automático será feito se todos os testes passarem

### 3. Para análise de segurança:
- Executa automaticamente toda segunda-feira
- Pode ser executado manualmente na aba Actions do GitHub

## Status Badges

Adicione estes badges ao README principal:

```markdown
![CI/CD](https://github.com/seu-usuario/todo/workflows/CI/CD%20Pipeline/badge.svg)
![PR Check](https://github.com/seu-usuario/todo/workflows/PR%20Quality%20Check/badge.svg)
![Security](https://github.com/seu-usuario/todo/workflows/Security%20&%20Dependency%20Scan/badge.svg)
```

## Estrutura de Arquivos

```
.github/
└── workflows/
    ├── ci.yml          # Pipeline principal
    ├── pr-check.yml    # Verificação de PRs
    ├── security.yml    # Análise de segurança
    └── README.md       # Esta documentação
```

## Melhorias Futuras

- [ ] Integração com SonarQube
- [ ] Deploy para múltiplos ambientes (staging, production)
- [ ] Notificações via Slack/Discord
- [ ] Cache mais otimizado
- [ ] Testes de performance
- [ ] Deploy com Docker
- [ ] Rollback automático em caso de falha