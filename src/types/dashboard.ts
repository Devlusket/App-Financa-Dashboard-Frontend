export type ValorPorCategoria = {
  categoriaId: string;
  nome: string;
  total: number;
};

export type ResumoFinanceiro = {
  renda: number;
  gasto: number;
  guardado: number;
  saldo: number;
};

export type RelatorioPessoa = ResumoFinanceiro & {
  pessoaId: string;
  nome: string;
  gastosPorCategoria?: ValorPorCategoria[];
  guardadoPorCategoria?: ValorPorCategoria[];
};

export type RelatorioMensal = {
  mesReferencia: string;
  porPessoa: RelatorioPessoa[];
  casa: ResumoFinanceiro;
  gastosPorCategoria: ValorPorCategoria[];
  guardadoPorCategoria?: ValorPorCategoria[];
};

export type Lancamento = {
  id: string;
  categoriaId: string;
  categoriaNome: string;
  descricao: string;
  valor: number;
  data: string;
  mesReferencia: string;
  responsavelPagamentoId: string | null;
  status: "PAGO" | "PENDENTE";
};

export type LancamentoPayload = {
  categoriaId: string;
  descricao: string;
  valor: number;
  data: string;
  responsavelPagamentoId: string;
  status: "PAGO" | "PENDENTE";
};
