<script setup lang="ts">
import { User, UserId } from "./domain/auth/User";
import { FormKit } from "@formkit/vue";

const user = User({ id: UserId(crypto.randomUUID()) });
</script>

<template>
  <FormKit type="button" label="Sign In with Google"></FormKit>
</template>
