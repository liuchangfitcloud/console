import { definePlugin } from "@halo-dev/console-shared";
import BlankLayout from "@/layouts/BlankLayout.vue";
import BasicLayout from "@/layouts/BasicLayout.vue";
import AuthenticationList from "./AuthenticationList.vue";
import IconKey from "~icons/ri/key-2-line";
import { markRaw } from "vue";

export default definePlugin({
  routes: [
    {
      path: "/authentication",
      component: BlankLayout,
      children: [
        {
          path: "",
          component: BasicLayout,
          children: [
            {
              path: "",
              name: "Authentication",
              component: AuthenticationList,
              meta: {
                title: "认证源",
                searchable: true,
                permissions: ["system:authentication:view"],
                menu: {
                  name: "认证源",
                  group: "system",
                  icon: markRaw(IconKey),
                  priority: 1,
                  mobile: true,
                },
              },
            },
          ],
        },
      ],
    },
  ],
});
