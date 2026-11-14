# Nexora AI · Frontend

Interface React para o backend Flask Nexora Analytics. O frontend não cria dados locais nem altera o banco ou os contratos da API.

## Requisitos

- Node.js 18 ou superior
- Backend Flask disponível em `http://localhost:5000` (ou URL configurada)

## Instalação e execução

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Execute os comandos na raiz deste projeto. O Vite inicia em `http://localhost:5173`. A variável `VITE_API_URL` define a URL base da API e, por padrão, aponta para `http://localhost:5000/api`. Edite essa variável no `.env` se o backend estiver em outro endereço. O arquivo `.env` é local e não deve ser versionado.

## Apresentação pelo celular

Abra **Apresentação** na navegação para exibir um QR code que abre a tela de login no celular. No modo local, inicie o Vite acessível pela rede:

```powershell
npm run dev -- --host 0.0.0.0
```

Conecte o celular à mesma rede Wi-Fi do computador. Se a página estiver aberta em `localhost`, o frontend seleciona um endereço IPv4 privado disponível para o QR code; se houver mais de um, escolha o endereço da rede Wi-Fi. Configure o `.env` local com `VITE_API_URL=http://<IP-DO-COMPUTADOR>:5000/api`, substitua o IP se ele mudar e reinicie o Vite para aplicar. O `.env` é ignorado pelo Git, então o endereço local não entra na configuração versionada. Permita conexões do Vite e do backend no firewall, se solicitado. Para apresentações públicas, publique o frontend em HTTPS e configure `VITE_API_URL` com a URL publicada da API.

O QR code não contém tokens nem credenciais. A pessoa que escanear precisará entrar com sua própria conta.

Para validar ou servir a versão de produção:

```powershell
npm run build
npm run preview
```

## Telas

- Login e cadastro de analista
- Dashboard com totais e série mensal vindos da API
- Publicações com busca e filtros de período, formato e tema
- Campanhas com operações CRUD e gerenciamento de publicações, métricas e conversões
- Funil de conversão
- Inteligência com recomendações e comparações descritivas
- Download autenticado de CSV
- Assistente de IA para perguntas sobre dados agregados da conta
- Apresentação com QR code para abrir o frontend no celular

O JWT é mantido em `sessionStorage` durante a sessão do navegador. O acesso às rotas protegidas é removido ao sair ou após uma resposta 401.
