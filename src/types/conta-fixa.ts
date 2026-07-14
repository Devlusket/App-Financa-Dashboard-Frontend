export type ContaFixa = {
  id: string;
  categoriaId: string;
  nome: string;
  valorAtual: number;
};

export type ContaFixaPayload = Omit<ContaFixa, "id">;
