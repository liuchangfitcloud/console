<script lang="ts" setup>
import {
  Dialog,
  Toast,
  VCard,
  VPagination,
  VEntity,
  VStatusDot,
  VEntityField,
  VLoading,
  VPageHeader,
  VSpace,
  IconAddCircle,
  VButton,
  IconEyeOff,
  IconEye,
  IconRefreshLine,
  VEmpty,
} from "@halo-dev/components";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { apiClient } from "@/utils/api-client";
import type { AuthSetting, AuthSettingList } from "@halo-dev/api-client";
import { formatDatetime } from "@/utils/date";
import { useRouteQuery } from "@vueuse/router";
import Fuse from "fuse.js";
import { usePermission } from "@/utils/permission";
import AuthenticationEditingModal from "./components/AuthenticationEditingModal.vue";
import { NameUriMap, supportAuthTypes } from "./auth-type";
import AuthTypeIcon from "./components/AuthTypeIcon.vue";
import IconKey from "~icons/ri/key-2-line";

const { currentUserHasPermission } = usePermission();

const checkedAll = ref(false);
const editingModal = ref<boolean>(false);

const authSettings = ref<AuthSettingList>({
  page: 1,
  size: 20,
  total: 0,
  items: [],
  first: true,
  last: false,
  hasNext: false,
  hasPrevious: false,
  totalPages: 0,
});
const loading = ref(false);
const selectedAuthDisplyName = ref<string[]>([]);
const selectedAuthSetting = ref<AuthSetting>();
const refreshInterval = ref();

const nameUriMap = ref({});

let fuse: Fuse<AuthSetting> | undefined = undefined;

const handleFetchAuthSetting = async (options?: { mute?: boolean }) => {
  try {
    clearInterval(refreshInterval.value);

    if (!options?.mute) {
      loading.value = true;
    }

    const { data } =
      await apiClient.extension.authSetting.listv1alpha1AuthSetting({
        page: authSettings.value.page,
        size: authSettings.value.size,
      });
    authSettings.value = data;

    const len = authSettings.value.items.length;
    for (let i = 0; i < len; i++) {
      const authSetting = authSettings.value.items[i];
      apiClient.extension.authSetting
        .getAuthSettingCallbackUri({
          name: authSetting.metadata.name,
        })
        .then((result) => {
          // nameUriMap[authSetting.metadata.name] = result.data.uri;
          nameUriMap.value[authSetting.metadata.name] = result.data.uri;
        })
        .catch((err) => {
          console.error(err);
        });
      // nameUriMap[authSetting.metadata.name] = uriData.uri;
    }

    // 本页面搜索
    fuse = new Fuse(data.items, {
      keys: ["displayName", "authType"],
      useExtendedSearch: true,
    });

    const deletedSettings = authSettings.value.items.filter(
      (authSetting) => !!authSetting.metadata.deletionTimestamp
    );

    if (deletedSettings.length) {
      refreshInterval.value = setInterval(() => {
        handleFetchAuthSetting({ mute: true });
      }, 3000);
    }
  } catch (e) {
    console.error("Failed to fetch users", e);
  } finally {
    selectedAuthSetting.value = undefined;
    loading.value = false;
  }
};

const keyword = ref("");

const searchResults = computed(() => {
  if (!fuse || !keyword.value) {
    return authSettings.value.items;
  }

  return fuse?.search(keyword.value).map((item) => item.item);
});

const handlePaginationChange = async ({
  page,
  size,
}: {
  page: number;
  size: number;
}) => {
  authSettings.value.page = page;
  authSettings.value.size = size;
  await handleFetchAuthSetting();
};

const handleDelete = async (authSetting: AuthSetting) => {
  Dialog.warning({
    title: "确定要删除该认证源吗？",
    description: "该操作不可恢复。",
    confirmType: "danger",
    onConfirm: async () => {
      try {
        await apiClient.extension.authSetting.deletev1alpha1AuthSetting({
          name: authSetting.metadata.name,
        });

        Toast.success("删除成功");
      } catch (e) {
        console.error("Failed to delete AuthSetting", e);
      } finally {
        await handleFetchAuthSetting();
      }
    },
  });
};

const handleDeleteInBatch = async () => {
  Dialog.warning({
    title: "确定要删除选中的认证源吗？",
    description: "该操作不可恢复。",
    confirmType: "danger",
    onConfirm: async () => {
      await Promise.all(
        selectedAuthDisplyName.value.map((name) => {
          return apiClient.extension.authSetting.deletev1alpha1AuthSetting({
            name,
          });
        })
      );
      await handleFetchAuthSetting();
      selectedAuthDisplyName.value.length = 0;
      Toast.success("删除成功");
    },
  });
};

watch(selectedAuthDisplyName, (newValue) => {
  checkedAll.value = newValue.length === authSettings.value.items?.length;
});

const checkSelection = (authSetting: AuthSetting) => {
  return (
    authSetting.metadata.name === selectedAuthSetting.value?.metadata.name ||
    selectedAuthDisplyName.value.includes(authSetting.metadata.name)
  );
};

const handleCheckAllChange = (e: Event) => {
  const { checked } = e.target as HTMLInputElement;

  if (checked) {
    selectedAuthDisplyName.value =
      authSettings.value.items.map((user) => {
        return user.metadata.name;
      }) || [];
  } else {
    selectedAuthDisplyName.value.length = 0;
  }
};

const handleOpenCreateModal = (authSetting: AuthSetting) => {
  selectedAuthSetting.value = authSetting;
  editingModal.value = true;
};

const onEditingModalClose = () => {
  routeQueryAction.value = undefined;
  handleFetchAuthSetting();
};

onMounted(() => {
  handleFetchAuthSetting();
});

onUnmounted(() => {
  clearInterval(refreshInterval.value);
});

// Route query action
const routeQueryAction = useRouteQuery<string | undefined>("action");

onMounted(() => {
  if (!routeQueryAction.value) {
    return;
  }
  if (routeQueryAction.value === "create") {
    editingModal.value = true;
  }
});
</script>
<template>
  <AuthenticationEditingModal
    v-model:visible="editingModal"
    :auth-setting="selectedAuthSetting"
    @close="onEditingModalClose"
  />

  <VPageHeader title="认证源">
    <template #icon>
      <IconKey class="mr-2 self-center" />
    </template>
    <template #actions>
      <VSpace>
        <VButton
          v-permission="['system:authentication:manage']"
          type="secondary"
          @click="editingModal = true"
        >
          <template #icon>
            <IconAddCircle class="h-full w-full" />
          </template>
          添加认证源
        </VButton>
      </VSpace>
    </template>
  </VPageHeader>

  <div class="m-0 md:m-4">
    <VCard :body-class="['!p-0']">
      <template #header>
        <div class="block w-full bg-gray-50 px-4 py-3">
          <div
            class="relative flex flex-col items-start sm:flex-row sm:items-center"
          >
            <div
              v-permission="['system:authentication:manage']"
              class="mr-4 hidden items-center sm:flex"
            >
              <input
                v-model="checkedAll"
                class="h-4 w-4 rounded border-gray-300 text-indigo-600"
                type="checkbox"
                @change="handleCheckAllChange"
              />
            </div>
            <div class="flex w-full flex-1 sm:w-auto">
              <FormKit
                v-if="!selectedAuthDisplyName.length"
                v-model="keyword"
                placeholder="输入认证源名称/类型搜索"
                type="text"
              ></FormKit>
              <VSpace v-else>
                <VButton type="danger" @click="handleDeleteInBatch">
                  删除
                </VButton>
              </VSpace>
            </div>
            <div class="mt-4 flex sm:mt-0">
              <VSpace spacing="lg">
                <div class="flex flex-row gap-2">
                  <div
                    class="group cursor-pointer rounded p-1 hover:bg-gray-200"
                    @click="handleFetchAuthSetting()"
                  >
                    <IconRefreshLine
                      v-tooltip="`刷新`"
                      :class="{ 'animate-spin text-gray-900': loading }"
                      class="h-4 w-4 text-gray-600 group-hover:text-gray-900"
                    />
                  </div>
                </div>
              </VSpace>
            </div>
          </div>
        </div>
      </template>
      <VLoading v-if="loading" />
      <Transition v-else-if="!authSettings.items.length" appear name="fade">
        <VEmpty message="你可以尝试刷新或者新建认证源" title="当前没有认证源">
          <template #actions>
            <VSpace>
              <VButton @click="handleFetchAuthSetting">刷新</VButton>
              <VButton
                v-permission="['system:authentication:manage']"
                type="primary"
                @click="editingModal = true"
              >
                <template #icon>
                  <IconAddCircle class="h-full w-full" />
                </template>
                新建认证源
              </VButton>
            </VSpace>
          </template>
        </VEmpty>
      </Transition>
      <Transition v-else appear name="fade">
        <ul
          class="box-border h-full w-full divide-y divide-gray-100"
          role="list"
        >
          <li v-for="(authSetting, index) in searchResults" :key="index">
            <VEntity :is-selected="checkSelection(authSetting)">
              <template
                v-if="
                  currentUserHasPermission(['system:authentication:manage'])
                "
                #checkbox
              >
                <input
                  v-model="selectedAuthDisplyName"
                  :value="authSetting.metadata.name"
                  class="h-4 w-4 rounded border-gray-300 text-indigo-600"
                  name="post-checkbox"
                  type="checkbox"
                />
              </template>
              <template #start>
                <VEntityField>
                  <template #description>
                    <AuthTypeIcon :type="authSetting.authType" />
                  </template>
                </VEntityField>
                <VEntityField
                  :title="authSetting.displayName"
                  :description="authSetting.metadata.name"
                />
              </template>
              <template #end>
                <VEntityField>
                  <template #description>
                    <IconEye
                      v-if="authSetting.open"
                      v-tooltip="`已开启`"
                      class="cursor-pointer text-sm transition-all hover:text-blue-600"
                    />
                    <IconEyeOff
                      v-else
                      v-tooltip="`已关闭`"
                      class="cursor-pointer text-sm transition-all hover:text-blue-600"
                    />
                  </template>
                </VEntityField>
                <VEntityField v-if="authSetting.metadata.deletionTimestamp">
                  <template #description>
                    <VStatusDot v-tooltip="`删除中`" state="warning" animate />
                  </template>
                </VEntityField>
                <VEntityField>
                  <template #description>
                    <span
                      class="truncate text-xs tabular-nums text-gray-500"
                      :title="nameUriMap[authSetting.metadata.name]"
                    >
                      {{ nameUriMap[authSetting.metadata.name] }}
                    </span>
                  </template>
                </VEntityField>
                <VEntityField>
                  <template #description>
                    <span class="truncate text-xs tabular-nums text-gray-500">
                      {{
                        formatDatetime(authSetting.metadata.creationTimestamp)
                      }}
                    </span>
                  </template>
                </VEntityField>
              </template>
              <template
                v-if="
                  currentUserHasPermission(['system:authentication:manage'])
                "
                #dropdownItems
              >
                <VButton
                  v-close-popper
                  block
                  type="secondary"
                  @click="handleOpenCreateModal(authSetting)"
                >
                  修改
                </VButton>
                <VButton
                  v-close-popper
                  block
                  type="danger"
                  @click="handleDelete(authSetting)"
                >
                  删除
                </VButton>
              </template>
            </VEntity>
          </li>
        </ul>
      </Transition>

      <template #footer>
        <div class="bg-white sm:flex sm:items-center sm:justify-end">
          <VPagination
            :page="authSettings.page"
            :size="authSettings.size"
            :total="authSettings.total"
            :size-options="[20, 30, 50, 100]"
            @change="handlePaginationChange"
          />
        </div>
      </template>
    </VCard>
  </div>
</template>
