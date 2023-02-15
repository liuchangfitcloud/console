<script lang="ts" setup>
import { computed, markRaw } from "vue";
import AuthTypeDefaultIcon from "~icons/ri/open-source-fill";
import { supportAuthTypes } from "../auth-type";

const props = withDefaults(
  defineProps<{
    type?: string;
    width?: number;
    height?: number;
    uri?: string;
    displayName?: string;
  }>(),
  {
    type: undefined,
    width: 8,
    height: 8,
    uri: undefined,
    displayName: undefined,
  }
);

const getIcon = computed(() => {
  if (props.type) {
    const authtypes = supportAuthTypes.filter(
      (authtype) => authtype.value === props.type
    );
    const icon = authtypes.length > 0 ? authtypes[0].icon : undefined;
    if (icon) return icon;
  }
  return markRaw(AuthTypeDefaultIcon);
});

const getClass = computed(() => {
  return "h-" + props.height + " w-" + props.width;
});
</script>

<template>
  <div>
    <template v-if="uri">
      <a :href="uri" :title="displayName">
        <component :is="getIcon" :class="getClass"> </component>
      </a>
    </template>
    <template v-else>
      <component :is="getIcon" :class="getClass"> </component>
    </template>
  </div>
</template>
