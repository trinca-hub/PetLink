export type FuncRoute =
  | "/adm-produtos"
  | "/adm-pets"
  | "/adm-pedidos"
  | "/adm-servicos";

export type FuncMenuItem = {
  title: string;
  subtitle: string;
  icon: string;
  route: FuncRoute;
};

export const FUNC_MENU: FuncMenuItem[] = [
  {
    title: "Gerenciar Produtos",
    subtitle: "Cadastro, edição e estoque de produtos",
    icon: "cube-outline",
    route: "/adm-produtos",
  },
  {
    title: "Gerenciar Pets",
    subtitle: "Cadastro e manutenção de pets vinculados",
    icon: "paw-outline",
    route: "/adm-pets",
  },
  {
    title: "Gerenciar Pedidos",
    subtitle: "Criar e cancelar pedidos com controle de itens",
    icon: "receipt-outline",
    route: "/adm-pedidos",
  },
  {
    title: "Gerenciar Serviços",
    subtitle: "Apenas visualização dos serviços cadastrados",
    icon: "construct-outline",
    route: "/adm-servicos",
  },
];
