<template>
  <el-empty description="請選擇管理項目" />
</template>

<route lang="yaml">
meta:
  layout: admin
  access: authenticated
  roles:
    - admin
  title: 管理
</route>
