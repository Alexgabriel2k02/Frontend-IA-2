# Nexora AI · Frontend

Interface React para o backend Flask Nexora Analytics. O frontend não cria dados locais nem altera o banco ou os contratos da API.

## Requisitos

- Node.js 18 ou superior
- Backend Flask disponível em `http://localhost:5000` (ou URL configurada)

## Instalação e execução

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

O Vite inicia em `http://localhost:5173`. Ajuste `VITE_API_URL` no `.env` se o backend estiver em outro endereço. O valor padrão é `http://localhost:5000/api`.

Para validar ou servir a versão de produção:

```powershell
npm run build
npm run preview
```

O login de demonstração documentado pelo backend é `demo@nexora.local` / `Nexora@12345`, se o banco tiver sido inicializado com os dados seed.

## Telas

- Login e cadastro de analista
- Dashboard com totais e série mensal vindos da API
- Publicações com busca e filtros de período, formato e tema
- Campanhas com operações CRUD e gerenciamento de publicações, métricas e conversões
- Funil de conversão
- Inteligência com recomendações e comparações descritivas
- Download autenticado de CSV

O JWT é mantido em `sessionStorage` durante a sessão do navegador. O acesso às rotas protegidas é removido ao sair ou após uma resposta 401.
