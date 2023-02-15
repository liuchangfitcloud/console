import dashboardModule from "./dashboard/module";
import postModule from "./contents/posts/module";
import pageModule from "./contents/pages/module";
import commentModule from "./contents/comments/module";
import attachmentModule from "./contents/attachments/module";
import themeModule from "./interface/themes/module";
import menuModule from "./interface/menus/module";
import pluginModule from "./system/plugins/module";
import userModule from "./system/users/module";
import roleModule from "./system/roles/module";
import settingModule from "./system/settings/module";
import actuatorModule from "./system/actuator/module";
import authenticationModule from "./system/authentication/module";

// const coreModules = [
//   dashboardModule,
//   postModule,
//   pageModule,
//   commentModule,
//   attachmentModule,
//   themeModule,
//   menuModule,
//   pluginModule,
//   userModule,
//   roleModule,
//   settingModule,
// ];

const coreModules = [
  postModule,
  pluginModule,
  settingModule,
  actuatorModule,
  dashboardModule,
  menuModule,
  commentModule,
  attachmentModule,
  pageModule,
  themeModule,
  userModule,
  roleModule,
  authenticationModule,
];

export { coreModules };
