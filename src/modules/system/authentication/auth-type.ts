import IconGitHub from "~icons/ri/github-fill";
import IconWeiBo from "~icons/ri/weibo-fill";
import AuthTypeDefaultIcon from "~icons/ri/open-source-fill";
import IconWechat from "~icons/ri/wechat-fill";
import IconQq from "~icons/ri/qq-fill";
import IconBaidu from "~icons/ri/baidu-fill";
import IconStackOverFlow from "~icons/ri/stack-overflow-fill";
import IconGoogle from "~icons/ri/google-fill";
import IconGitte from "~icons/simple-icons/gitee";
import { markRaw } from "vue";
//定义类型
export interface AuthType {
  label: string;
  value: string;
  icon?: string;
}

export interface NameUriMap {
  name: string;
  uri: string;
}

export const PROVIDER_GIT_HUB = "GITHUB"; // github
export const PROVIDER_WEI_BO = "WEIBO"; //新浪微博开放平台
export const PROVIDER_OIDC = "OIDC"; //OIDC
export const PROVIDER_WECHAT_OPEN = "WECHAT_OPEN"; //开发平台
export const PROVIDER_WECHAT_MP = "WECHAT_MP"; //公众号
export const PROVIDER_QQ = "QQ"; //qq开放平台
export const PROVIDER_BAIDU = "BAIDU"; //百度
export const PROVIDER_STACK_OVERFLOW = "STACK_OVERFLOW"; //StackOverflow
export const PROVIDER_GOOGLE = "GOOGLE"; //google
export const PROVIDER_GITEE = "GITEE"; //gitee

export const supportAuthTypes: AuthType[] = [
  {
    label: "请选择提供商",
    value: "",
  },
  {
    label: "Github",
    value: PROVIDER_GIT_HUB,
    icon: markRaw(IconGitHub),
  },
  {
    label: "新浪微博",
    value: PROVIDER_WEI_BO,
    icon: markRaw(IconWeiBo),
  },
  {
    label: "微信开放平台",
    value: PROVIDER_WECHAT_OPEN,
    icon: markRaw(IconWechat),
  },
  {
    label: "微信公众号",
    value: PROVIDER_WECHAT_MP,
    icon: markRaw(IconWechat),
  },
  {
    label: "QQ",
    value: PROVIDER_QQ,
    icon: markRaw(IconQq),
  },
  {
    label: "百度",
    value: PROVIDER_BAIDU,
    icon: markRaw(IconBaidu),
  },
  {
    label: "StackOverflow",
    value: PROVIDER_STACK_OVERFLOW,
    icon: markRaw(IconStackOverFlow),
  },
  {
    label: "Google",
    value: PROVIDER_GOOGLE,
    icon: markRaw(IconGoogle),
  },
  {
    label: "Gitee",
    value: PROVIDER_GITEE,
    icon: markRaw(IconGitte),
  },
  {
    label: "OIDC",
    value: PROVIDER_OIDC,
    icon: markRaw(AuthTypeDefaultIcon),
  },
];
