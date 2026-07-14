# Checklist de Frontend — Sistema de Controle de Gastos (Casa)

> Documento autocontido. Contém todo o contexto necessário para implementar o frontend do zero, sem depender de conversas anteriores. Consome a API descrita na "Checklist de Backend" (mesmo projeto).

---

## 1. Contexto do projeto

Sistema pessoal (não é projeto de portfólio) de controle de gastos mensais de um casal que mora junto. O ponto forte do sistema deve ser o **dashboard**: uma tela única, visual e bonita, que concentra praticamente toda a informação do dia a dia. O relatório mensal é secundário — só uma tela de consulta histórica mais simples.

**Conceitos-chave do domínio (para o frontend entender os dados que exibe):**
- Login único por "casa" (não há login individual — um único usuário/senha compartilhado).
- Existem 1 ou 2 `Pessoa`s cadastradas na casa.
- Cada gasto (`Lancamento`) pertence a uma `Categoria`, que já tem uma regra de divisão fixa (ex: aluguel 50/50, mercado 100% de uma pessoa) — o usuário não escolhe a divisão na hora de lançar, ela já vem da categoria.
- Ao lançar/confirmar um gasto, o usuário escolhe quem **pagou** (`responsavelPagamento`) — isso é independente de estar logado, já que o login é único.
- Categorias marcadas como poupança (`ehPoupanca: true`) representam dinheiro guardado (caixinha, investimento), não gasto.
- **Não existe conceito de "quem deve pra quem"** — não criar nenhuma tela ou componente de saldo de dívida entre as pessoas. Toda métrica é sempre **individual** (por pessoa) ou **da casa** (soma dos dois).
- Toda visão numérica principal segue a fórmula: `saldo = renda - gasto - guardado`, sempre com toggle entre individual e casa.

---

## 2. Stack técnica

- **Framework:** Next.js (App Router)
- **Estilização:** Tailwind CSS + shadcn/ui (componentes prontos: card, table, dialog, tabs, select, badge, button)
- **Animações:** Framer Motion (transições de números, entrada de cards, toggles)
- **Gráficos:** Recharts (gráfico de categorias — pizza ou barra)
- **Requisições HTTP:** `fetch` nativo ou `axios`, com um client centralizado que injeta o JWT
- **Gerenciamento de estado:** React state/hooks (`useState`, `useEffect`, `useContext` para auth) — não é necessário Redux/Zustand para esse escopo
- **Formulários:** `react-hook-form` + `zod` para validação (opcional, mas recomendado para os formulários de lançamento/categoria)
- **Deploy:** Vercel

**Dependências principais:**
```
next, react, react-dom
tailwindcss
shadcn/ui (via CLI, não é pacote npm tradicional)
framer-motion
recharts
react-hook-form
zod
@hookform/resolvers
date-fns (formatação de datas/mês)
```

---

## 3. Contrato com a API (resumo)

> Referência completa em "Checklist de Backend". Aqui está o resumo do que o frontend precisa consumir.

**Auth:**
- `POST /auth/login` → `{ usuario, senha }` → retorna `{ token }`. Guardar o token (ex: em memória + cookie httpOnly se possível, ou localStorage como fallback simples já que é uso pessoal).
- Todas as outras rotas exigem header `Authorization: Bearer {token}`.

**Recursos principais:**
- `GET/POST /pessoas`
- `GET/POST/PATCH/DELETE /categorias`
- `GET/POST/PATCH/DELETE /contas-fixas`
- `GET/POST/PATCH /rendas` + `POST /rendas/{id}/adicionais`
- `GET/POST/PATCH/DELETE /lancamentos` + `PATCH /lancamentos/{id}/status`
- `GET /relatorios/mensal?mes=YYYY-MM` → retorna renda/gasto/guardado/saldo por pessoa e da casa, + gastos por categoria (ver formato completo na checklist de backend, seção 6)

---

## 4. Estrutura de páginas (App Router)

```
/app
  /login              → tela de login (única, sem cadastro visível no dia a dia)
  /dashboard           → tela principal (ver seção 5)
  /categorias           → CRUD de categorias e regras de divisão
  /contas-fixas          → CRUD de contas fixas
  /renda                → cadastro/edição de renda mensal por pessoa
  /relatorios            → tela secundária de consulta histórica (seletor de mês)
  /layout.tsx            → layout raiz com navegação lateral/topo + proteção de rota (redirect pra /login se não autenticado)
```

---

## 5. Dashboard — especificação detalhada

Tela principal, com **toggle global "Individual ↔ Casa"** (afeta todos os cards abaixo simultaneamente) e um **seletor de mês** (default: mês atual).

### 5.1 Cards de resumo no topo
4 cards lado a lado (responsivo: empilha em mobile):
- **Renda** (total do mês, considerando o toggle)
- **Gasto** (total do mês)
- **Guardado** (poupança/investimento do mês)
- **Saldo** (sobra não alocada — destaque visual maior, é o número mais importante)

Usar Framer Motion pra animar os valores subindo/contando ao carregar (efeito "odômetro").

### 5.2 Faturas por pessoa
Bloco mostrando, lado a lado ou empilhado, o breakdown de gasto de cada pessoa por categoria — ex:
```
Lucas          Namorada
Mercado R$450   Luz/Água R$350
Aluguel R$450   Aluguel R$450
```
Usar Tabs (shadcn) ou duas colunas fixas, dependendo do espaço.

### 5.3 Fatura total da casa
Card único consolidado com a soma de todas as categorias do mês (lista simples ordenada por valor, maior pro menor).

### 5.4 Guardado do mês
Bloco mostrando quanto cada pessoa guardou (por categoria de poupança) + total da casa.

### 5.5 Lista de lançamentos do mês
Tabela (shadcn `Table`) com colunas: descrição, categoria, valor, data, responsável pelo pagamento, status (badge Pago/Pendente clicável pra alternar).
- Filtro rápido por pessoa e por categoria (select no topo da tabela)
- Botão "+ Novo lançamento" abrindo um `Dialog` com formulário (categoria, descrição, valor, data, responsável, status)

### 5.6 Gráfico de categorias
Gráfico de pizza ou barra (Recharts) mostrando distribuição de gastos do mês por categoria. Cores consistentes com o resto da UI.

---

## 6. Outras telas

### 6.1 Login (`/login`)
- Formulário simples: email + senha
- Chama `POST /auth/login`, salva token, redireciona pro dashboard
- Tratamento de erro (credenciais inválidas)

### 6.2 Categorias (`/categorias`)
- Lista de categorias existentes com badge indicando o tipo de divisão (ex: "50/50", "Lucas 100%", "Poupança")
- Formulário de criação/edição: nome, tipo de divisão (select), campos condicionais (% ou responsável, dependendo do tipo), toggle `ehPoupanca`
- Ação de deletar com confirmação (`Dialog` de confirmação)

### 6.3 Contas Fixas (`/contas-fixas`)
- Lista com nome, categoria vinculada, valor atual
- Edição rápida do valor (inline edit ou dialog) — chama `PATCH /contas-fixas/{id}`
- Lembrete visual (texto pequeno) de que isso é só cadastro de referência, não gera lançamento automático

### 6.4 Renda (`/renda`)
- Seletor de mês + pessoa
- Campo de valor fixo (editável)
- Lista de "adicionais" do mês (freelance, hora extra) com botão de adicionar novo item
- Sugestão de copiar valor fixo do mês anterior ao criar um novo mês (botão "usar valor de {mês anterior}")

### 6.5 Relatórios (`/relatorios`)
- Seletor de mês/ano
- Mesmos números do dashboard (renda, gasto, guardado, saldo — individual e casa), em formato mais simples/tabular, sem os gráficos elaborados do dashboard
- Serve como "arquivo" pra consultar meses anteriores

---

## 7. Componentes reutilizáveis a criar

- [x] `ResumoCard` — card de métrica com valor animado (usado no dashboard)
- [x] `ToggleIndividualCasa` — toggle reutilizável entre visão individual/casa
- [x] `SeletorMes` — dropdown/date-picker simplificado pra escolher mês/ano
- [x] `LancamentoForm` — formulário de criar/editar lançamento (usado em Dialog)
- [x] `CategoriaForm` — formulário de criar/editar categoria com campos condicionais por `tipoDivisao`
- [x] `StatusBadge` — badge clicável Pago/Pendente
- [x] `GraficoCategorias` — wrapper do Recharts com o estilo do projeto
- [x] `ApiClient` — client HTTP centralizado (injeta token, trata erros 401 redirecionando pro login)

---

## 8. Checklist passo a passo

### Fase 1 — Setup do projeto
- [x] Criar projeto Next.js (App Router, TypeScript)
- [x] Configurar Tailwind CSS
- [x] Instalar e configurar shadcn/ui (rodar `pnpm dlx shadcn@latest init`)
- [x] Instalar Framer Motion, Recharts, react-hook-form, zod, date-fns
- [x] Configurar variável de ambiente `NEXT_PUBLIC_API_URL` apontando pro backend

### Fase 2 — Autenticação e layout base
- [x] Criar `ApiClient` centralizado (fetch wrapper com header Authorization)
- [x] Criar contexto de autenticação (`AuthContext`) guardando o token e estado de login
- [x] Criar página `/login` com formulário + chamada a `POST /auth/login`
- [x] Criar `layout.tsx` raiz com navegação (sidebar ou topbar: Dashboard, Categorias, Contas Fixas, Renda, Relatórios)
- [x] Implementar proteção de rota: redirecionar pra `/login` se não houver token válido
- [x] Testar fluxo: logar → navegar entre páginas → deslogar

### Fase 3 — Componentes base reutilizáveis
- [x] Criar `ResumoCard` com animação Framer Motion
- [x] Criar `ToggleIndividualCasa`
- [x] Criar `SeletorMes`
- [x] Criar `StatusBadge`
- [x] Criar `ApiClient` com tratamento de erro genérico (toast de erro, se usar algum componente de notificação do shadcn)

### Fase 4 — Página de Categorias
- [x] Listar categorias (`GET /categorias`) em cards ou tabela, com badge do tipo de divisão
- [x] Criar `CategoriaForm` com campos condicionais por `tipoDivisao`
- [x] Implementar criação (`POST /categorias`)
- [x] Implementar edição (`PATCH /categorias/{id}`)
- [x] Implementar exclusão com confirmação (`DELETE /categorias/{id}`)

### Fase 5 — Página de Contas Fixas
- [x] Listar contas fixas (`GET /contas-fixas`)
- [x] Implementar criação (`POST /contas-fixas`)
- [x] Implementar edição rápida de valor (`PATCH /contas-fixas/{id}`)
- [x] Implementar exclusão (`DELETE /contas-fixas/{id}`)

### Fase 6 — Página de Renda
- [x] Seletor de mês + pessoa
- [x] Exibir/editar valor fixo (`GET/POST/PATCH /rendas`)
- [x] Listar e adicionar "adicionais" (`POST /rendas/{id}/adicionais`)
- [x] Botão de copiar valor fixo do mês anterior

### Fase 7 — Dashboard (tela principal)
- [x] Implementar toggle global Individual/Casa + seletor de mês no topo da página
- [x] Buscar dados de `GET /relatorios/mensal?mes=` e distribuir entre os componentes
- [x] Implementar os 4 `ResumoCard`s (Renda, Gasto, Guardado, Saldo) com animação
- [x] Implementar bloco de Faturas por Pessoa
- [x] Implementar bloco de Fatura Total da Casa
- [x] Implementar bloco de Guardado do Mês
- [x] Implementar tabela de lançamentos com filtro por pessoa/categoria
- [x] Implementar `LancamentoForm` em Dialog (criar/editar) + ação de marcar pago/pendente
- [x] Implementar `GraficoCategorias` (Recharts) com os dados de `gastosPorCategoria`
- [x] Testar responsividade em mobile (cards empilhando, tabela com scroll horizontal se necessário)

### Fase 8 — Página de Relatórios (secundária)
- [x] Seletor de mês/ano
- [x] Reaproveitar os mesmos dados/lógica do dashboard, em layout mais simples (sem gráfico, mais tabular)

### Fase 9 — Polimento visual
- [x] Definir paleta de cores e tipografia consistente em todo o app (tema claro, e dark mode se quiser — opcional)
- [x] Revisar espaçamentos, estados de loading (skeletons) e estados vazios ("nenhum lançamento este mês ainda")
- [x] Revisar mensagens de erro amigáveis em todos os formulários
- [x] Testar em telas pequenas (celular) já que provavelmente vai ser usado bastante no mobile

### Fase 10 — Deploy
- [ ] Configurar variáveis de ambiente na Vercel (`NEXT_PUBLIC_API_URL` apontando pro backend em produção no Render)
- [ ] Deploy na Vercel
- [ ] Testar fluxo completo em produção: login → dashboard → criar lançamento → conferir relatório

---

## 9. Critérios de aceite gerais

- [ ] Dashboard carrega e exibe corretamente dados individuais e da casa, alternando via toggle
- [ ] Nenhuma tela ou componente exibe conceito de "saldo entre pessoas" (dívida) — isso é decisão de escopo confirmada, não é omissão
- [ ] Categorias de poupança (`ehPoupanca`) aparecem separadas de gastos normais em todos os lugares relevantes
- [ ] Todos os formulários validam campos obrigatórios antes de enviar (usar zod)
- [ ] App funciona bem em mobile (uso real esperado é bastante no celular)
- [ ] Token expirado/inválido redireciona automaticamente pro login, sem tela em branco ou erro não tratado
