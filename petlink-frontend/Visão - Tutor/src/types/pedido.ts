export type PedidoDTO = {
  id: number;
  usuarioId: number;
  dataPedido: string;
};

export type ItemPedidoDTO = {
  id: number;
  pedidoId: number;
  produtoId: number;
  quantidade: number;
};

export type ProdutoResumoPedido = {
  id: number;
  nome: string;
  preco: number;
  foto?: string;
};

export type ItemPedidoComProduto = ItemPedidoDTO & {
  produto?: ProdutoResumoPedido;
};

export type PedidoResumo = {
  pedido: PedidoDTO;
  itensCount: number;
  total: number;
};
