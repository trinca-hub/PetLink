export type AdminRoute =
  | "/adm-funcionarios"
  | "/adm-veterinarios"
  | "/adm-usuarios"
  | "/adm-produtos"
  | "/adm-anuncios"
  | "/adm-cadastro-adm"
  | "/adm-pets"
  | "/adm-pedidos"
  | "/adm-servicos";

export type AdminMenuItem = {
  title: string;
  subtitle: string;
  icon: string;
  route: AdminRoute;
};

export const ADMIN_MENU: AdminMenuItem[] = [
  {
    title: "Gerenciar Funcionários",
    subtitle: "Visualize e organize os funcionários",
    icon: "briefcase-outline",
    route: "/adm-funcionarios",
  },
  {
    title: "Gerenciar Veterinários",
    subtitle: "Controle de veterinários ativos",
    icon: "medkit-outline",
    route: "/adm-veterinarios",
  },
  {
    title: "Gerenciar Usuários/Tutores",
    subtitle: "Acompanhe contas e dados dos tutores",
    icon: "people-outline",
    route: "/adm-usuarios",
  },
  {
    title: "Gerenciar Produtos",
    subtitle: "Catálogo e disponibilidade de produtos",
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
    subtitle: "Criar pedidos e cancelar com estorno de estoque",
    icon: "receipt-outline",
    route: "/adm-pedidos",
  },
  {
    title: "Gerenciar Serviços",
    subtitle: "CRUD de serviços vinculados aos pets",
    icon: "construct-outline",
    route: "/adm-servicos",
  },
  {
    title: "Gerenciar Anúncios",
    subtitle: "Modere e acompanhe anúncios publicados",
    icon: "megaphone-outline",
    route: "/adm-anuncios",
  },
  {
    title: "Cadastrar novo Administrador",
    subtitle: "Cadastrar um novo perfil administrador",
    icon: "person-add-outline",
    route: "/adm-cadastro-adm",
  },
];
