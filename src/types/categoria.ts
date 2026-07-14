export type Pessoa = {
  id: string;
  nome: string;
};

export type TipoDivisao = "FIXO_POR_PESSOA" | "PERCENTUAL" | "VALOR_FIXO_DIVIDIDO";

export type DivisaoPercentual = {
  pessoaId: string;
  percentual: number;
};

export type Categoria = {
  id: string;
  nome: string;
  tipoDivisao: TipoDivisao;
  responsavelId: string | null;
  ehPoupanca: boolean;
  divisoesPercentuais: DivisaoPercentual[];
};

export type CategoriaPayload = Omit<Categoria, "id">;
