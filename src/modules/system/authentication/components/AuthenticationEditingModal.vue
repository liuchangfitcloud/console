<script lang="ts" setup>
// core libs
import { computed, nextTick, ref, watch } from "vue";
import { rbacAnnotations } from "@/constants/annotations";
import { apiClient } from "@/utils/api-client";
import type { AuthSetting } from "@halo-dev/api-client";
import { FormKitOptionsList } from "@formkit/inputs";
import { useFetchRole } from "../../roles/composables/use-role";
import {
  PROVIDER_OIDC,
  PROVIDER_STACK_OVERFLOW,
  supportAuthTypes,
} from "../auth-type";

// components
import { Toast, VButton, VModal, VSpace } from "@halo-dev/components";
import SubmitButton from "@/components/button/SubmitButton.vue";

// libs
import cloneDeep from "lodash.clonedeep";
import { reset } from "@formkit/core";

// hooks
import { setFocus } from "@/formkit/utils/focus";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    authSetting?: AuthSetting;
  }>(),
  {
    visible: false,
    authSetting: undefined,
  }
);

const emit = defineEmits<{
  (event: "update:visible", visible: boolean): void;
  (event: "close"): void;
}>();

const initialFormState: AuthSetting = {
  apiVersion: "v1alpha1",
  open: true,
  displayName: "",
  authUri: "",
  tokenUri: "",
  userInfoUri: "",
  logoutUri: "",
  authType: "",
  clientId: "",
  clientSecret: "",
  alipayPublicKey: "",
  stackOverflowKey: "",
  agentId: "",
  usertype: "",
  domainPrefix: "",
  scopes: [],
  deviceId: "",
  authServerId: "",
  openProxy: false,
  proxyTimeout: 3000,
  proxyHost: "",
  proxyPort: 0,
  userUniqueField: "",
  autoRegister: true,
  roleRef: "",
  kind: "AuthSetting",
  metadata: {
    name: "",
  },
};

const formState = ref<AuthSetting>(cloneDeep(initialFormState));
const saving = ref(false);

const isUpdateMode = computed(() => {
  return !!formState.value.metadata.creationTimestamp;
});

const creationModalTitle = computed(() => {
  return isUpdateMode.value ? "编辑认证源" : "新增认证源";
});

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      setFocus(isUpdateMode.value ? "displayNameInput" : "userNameInput");
    } else {
      handleResetForm();
    }
  }
);

watch(
  () => props.authSetting,
  (authSetting) => {
    if (authSetting) {
      formState.value = cloneDeep(authSetting);
    } else {
      handleResetForm();
    }
  }
);

const onVisibleChange = (visible: boolean) => {
  emit("update:visible", visible);
  if (!visible) {
    emit("close");
  }
};

const { roles } = useFetchRole();

const rolesMap = computed<FormKitOptionsList>(() => {
  return [
    {
      label: "请选择角色",
      value: "",
    },
    ...roles.value.map((role) => {
      return {
        label:
          role.metadata?.annotations?.[rbacAnnotations.DISPLAY_NAME] ||
          role.metadata.name,
        value: role.metadata?.name,
      };
    }),
  ];
});

const handleResetForm = () => {
  formState.value = cloneDeep(initialFormState);
  reset("auth-form");
};

const handleCreateUser = async () => {
  await nextTick();
  try {
    saving.value = true;
    if (isUpdateMode.value) {
      formState.value.proxyTimeout = Number(formState.value.proxyTimeout);
      formState.value.proxyPort = Number(formState.value.proxyPort);
      await apiClient.extension.authSetting.updatev1alpha1AuthSetting({
        name: formState.value.metadata.name,
        authSetting: formState.value,
      });
    } else {
      //自动获取一个32的uuid 这里暂时有点问题
      formState.value.metadata.generateName = formState.value.authType + "-";
      formState.value.proxyTimeout = Number(formState.value.proxyTimeout);
      formState.value.proxyPort = Number(formState.value.proxyPort);
      await apiClient.extension.authSetting.createv1alpha1AuthSetting({
        authSetting: formState.value,
      });
    }
    onVisibleChange(false);
    Toast.success("保存成功");
  } catch (e) {
    console.error("Failed to create or update AuthSetting", e);
  } finally {
    saving.value = false;
  }
};
</script>
<template>
  <VModal
    :title="creationModalTitle"
    :visible="visible"
    :width="700"
    @update:visible="onVisibleChange"
  >
    <FormKit
      id="auth-form"
      name="auth-form"
      :config="{ validationVisibility: 'submit' }"
      type="form"
      @submit="handleCreateUser"
    >
      <div>
        <div class="md:grid md:grid-cols-4 md:gap-6">
          <div class="md:col-span-1">
            <div class="sticky top-0">
              <span class="text-base font-medium text-gray-900">
                基础属性
              </span>
            </div>
          </div>
          <div class="mt-5 divide-y divide-gray-100 md:col-span-3 md:mt-0">
            <FormKit
              v-model="formState.open"
              label="是否开启"
              type="radio"
              :options="[
                { label: '是', value: true },
                { label: '否', value: false },
              ]"
              name="open"
              validation="required"
            ></FormKit>
            <FormKit
              v-model="formState.displayName"
              label="显示名称"
              type="text"
              name="displayName"
              validation="required|length:0,100"
            ></FormKit>
            <FormKit
              v-model="formState.authType"
              label="提供商"
              placeholder="选择提供商"
              type="select"
              name="authType"
              :options="supportAuthTypes"
              validation="required"
            ></FormKit>
            <FormKit
              v-model="formState.clientId"
              label="客户端ID"
              placeholder="请填写客户端ID"
              type="text"
              name="clientId"
              validation="required"
            ></FormKit>
            <FormKit
              v-model="formState.clientSecret"
              label="客户端密钥"
              placeholder="请填写客户端密钥"
              type="password"
              name="clientSecret"
              validation="required"
            ></FormKit>
          </div>
        </div>
      </div>
    </FormKit>

    <div
      v-if="
        formState.authType === PROVIDER_STACK_OVERFLOW ||
        formState.authType === PROVIDER_OIDC
      "
      class="py-5"
    >
      <div class="border-t border-gray-200"></div>
    </div>

    <div
      v-if="
        formState.authType === PROVIDER_STACK_OVERFLOW ||
        formState.authType === PROVIDER_OIDC
      "
      class="md:grid md:grid-cols-4 md:gap-6"
    >
      <div class="md:col-span-1">
        <div class="sticky top-0">
          <span class="text-base font-medium text-gray-900"> 扩展属性 </span>
        </div>
      </div>
      <div class="mt-5 divide-y divide-gray-100 md:col-span-3 md:mt-0">
        <FormKit
          v-if="formState.authType === PROVIDER_STACK_OVERFLOW"
          v-model="formState.stackOverflowKey"
          label="stackOverFlowKey"
          type="text"
          name="stackOverflowKey"
          validation="required"
        />
        <FormKit
          v-if="formState.authType === PROVIDER_OIDC"
          v-model="formState.authUri"
          label="认证地址"
          type="url"
          name="authUri"
          validation="required"
        />
        <FormKit
          v-if="formState.authType === PROVIDER_OIDC"
          v-model="formState.tokenUri"
          label="凭证地址"
          type="url"
          name="tokenUri"
          validation="required"
        />
        <FormKit
          v-if="formState.authType === PROVIDER_OIDC"
          v-model="formState.userInfoUri"
          label="用户信息地址"
          type="url"
          name="userInfoUri"
          validation="required"
        />
      </div>
    </div>

    <div class="py-5">
      <div class="border-t border-gray-200"></div>
    </div>

    <div class="md:grid md:grid-cols-4 md:gap-6">
      <div class="md:col-span-1">
        <div class="sticky top-0">
          <span class="text-base font-medium text-gray-900"> 注册属性 </span>
        </div>
      </div>
      <div class="mt-5 divide-y divide-gray-100 md:col-span-3 md:mt-0">
        <FormKit
          v-model="formState.autoRegister"
          label="开启自动注册"
          type="radio"
          :options="[
            { label: '是', value: true },
            { label: '否', value: false },
          ]"
          name="autoRegister"
          validation="required"
        ></FormKit>
        <template v-if="formState.autoRegister">
          <FormKit
            v-model="formState.userUniqueField"
            label="用户唯一标识"
            placeholder="请填写提供商userInfo接口中返回的字段"
            help="如果当前字段不填写或填写的字段不存在以JustAuth返回的userName作为唯一"
            type="text"
            name="userUniqueField"
          ></FormKit>
          <FormKit
            v-model="formState.roleRef"
            label="绑定角色"
            placeholder="请选择角色"
            help="如果是新用户默认绑定的角色"
            type="select"
            :options="rolesMap"
            name="roleRef"
            validation="required"
          ></FormKit>
        </template>
      </div>
    </div>

    <div class="py-5">
      <div class="border-t border-gray-200"></div>
    </div>

    <div class="md:grid md:grid-cols-4 md:gap-6">
      <div class="md:col-span-1">
        <div class="sticky top-0">
          <span class="text-base font-medium text-gray-900"> 代理属性 </span>
        </div>
      </div>
      <div class="mt-5 divide-y divide-gray-100 md:col-span-3 md:mt-0">
        <FormKit
          v-model="formState.openProxy"
          label="开启代理"
          type="radio"
          :options="[
            { label: '是', value: true },
            { label: '否', value: false },
          ]"
          name="openProxy"
          validation="required"
        ></FormKit>
        <template v-if="formState.openProxy">
          <FormKit
            v-model="formState.proxyTimeout"
            label="代理连接时间"
            placeholder="默认3000"
            type="number"
            name="proxyTimeout"
            validation="required"
          ></FormKit>
          <FormKit
            v-model="formState.proxyHost"
            label="代理地址"
            placeholder="请填写IP或者域名"
            type="text"
            name="proxyHost"
            validation="required"
          ></FormKit>
          <FormKit
            v-model="formState.proxyPort"
            label="代理端口"
            placeholder="请填写端口号"
            type="number"
            name="proxyPort"
            validation="required"
          ></FormKit>
        </template>
      </div>
    </div>
    <template #footer>
      <VSpace>
        <SubmitButton
          v-if="visible"
          :loading="saving"
          type="secondary"
          @submit="$formkit.submit('auth-form')"
        >
        </SubmitButton>
        <VButton @click="onVisibleChange(false)">取消 Esc</VButton>
      </VSpace>
    </template>
  </VModal>
</template>
