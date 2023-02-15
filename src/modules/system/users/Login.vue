<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import router from "@/router";
import IconLogo from "~icons/core/logo?width=5rem&height=2rem";
import { useUserStore } from "@/stores/user";
import LoginForm from "@/components/login/LoginForm.vue";
import { apiClient } from "@/utils/api-client";
import type { AllowAuthSettingList } from "@halo-dev/api-client";
import AuthTypeIcon from "../authentication/components/AuthTypeIcon.vue";

const userStore = useUserStore();

const allowAuthSettingList = ref<AllowAuthSettingList>({
  data: [],
});

onBeforeMount(() => {
  if (!userStore.isAnonymous) {
    localStorage.setItem("logged_in", "true");
    router.push({ name: "Dashboard" });
  } else {
    getAllowList();
  }
});

const getAllowList = async () => {
  const { data } = await apiClient.authSetting.getAuthSettingAllowList();
  allowAuthSettingList.value = data;
};

function onLoginSucceed() {
  window.location.reload();
}
</script>
<template>
  <div class="flex h-screen flex-col items-center justify-center">
    <IconLogo class="mb-8" />
    <div class="login-form flex w-72 flex-col">
      <LoginForm @succeed="onLoginSucceed" />
      <div class="mt-2 flex flex-row flex-wrap items-center justify-center">
        <AuthTypeIcon
          v-for="allow in allowAuthSettingList.data"
          :key="allow.name"
          :type="allow.authType"
          :width="8"
          :height="8"
          :uri="allow.uri"
          :display-name="allow.displayName"
        ></AuthTypeIcon>
      </div>
    </div>
  </div>
</template>
