import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      '@typescript-eslint/ban-ts-comment': 'off',
      "max-len": [
        "error",
        {
          code: 180,        // 👈 Số ký tự tối đa trên 1 dòng (mặc định là 80)
          tabWidth: 2,      // Độ rộng tab
          ignoreUrls: true, // Bỏ qua khi dòng chứa URL
          ignoreStrings: true, // Bỏ qua chuỗi dài
          ignoreTemplateLiterals: true, // Bỏ qua template string dài
          ignoreComments: true, // Bỏ qua comment dài
        },
      ],
      "@typescript-eslint/no-unused-vars": "warn",
      "no-debugger": "off"
    },
  },
)
