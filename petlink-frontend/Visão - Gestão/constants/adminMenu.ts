export type AdminRoute =
  | "/adm-funcionarios"
  | "/adm-veterinarios"
  | "/adm-usuarios"
  | "/adm-produtos"
  | "/adm-anuncios"
  | "/adm-cadastro-adm";

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
