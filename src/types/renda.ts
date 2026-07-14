export type RendaAdicional = {
  id: string;
  descricao: string;
  valor: number;
};

export type RendaConsulta = {
  existe: boolean;
  id: string | null;
  pessoaId: string;
  mesReferencia: string;
  valorFixo: number | null;
  adicionais: RendaAdicional[];
  valorFixoSugerido: number | null;
};
