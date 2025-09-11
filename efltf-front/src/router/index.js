import { route } from "quasar/wrappers";
import { createRouter, createWebHistory } from "vue-router";
import { isLoggedIn } from 'src/utils/auth'
import routes from "./routes";

const publicPaths = ['/login', '/signup']

export default route(function () {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory(),
  });

  return Router;
});