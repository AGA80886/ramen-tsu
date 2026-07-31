import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'src/typed-router.d.ts',
      'src/auto-imports.d.ts',
      'src/components.d.ts',
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],

    languageOptions: {
      parser: vueParser,

      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },

      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      /*
       * JavaScript
       */
      'no-console': 'warn',
      'no-debugger': 'warn',

      /*
       * TypeScript
       */
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
        },
      ],

      /*
       * Vue
       */
      'vue/multi-word-component-names': 'off',

      'vue/html-self-closing': [
        'warn',
        {
          html: {
            normal: 'always',
            void: 'always',
            component: 'always',
          },
        },
      ],

      'vue/no-mutating-props': 'error',

      'vue/no-unused-components': 'warn',

      /*
       * Style
       */
      'object-curly-spacing': ['warn', 'always'],

      semi: ['warn', 'never'],

      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true,
        },
      ],
    },
  },
]
