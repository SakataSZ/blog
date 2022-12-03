type Routes = {
  href: string;
  title: string;
  icon: string;
};

const routes: Routes[] = [
  {
    href: "/",
    title: "Home",
    icon: "🏠",
  },
  {
    href: "/about",
    title: "About",
    icon: "🖐️",
  },
  {
    href: "/blog",
    title: "Blog",
    icon: "📖",
  },
];

export default routes;
