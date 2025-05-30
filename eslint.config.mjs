import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',  // Menonaktifkan aturan penggunaan 'any'
      'react/no-unescaped-entities': 'off',        // Menonaktifkan aturan unescaped entities
      '@typescript-eslint/no-unused-vars': 'off',  // Menonaktifkan aturan unused vars
      'react-hooks/exhaustive-deps': 'off',        // Menonaktifkan aturan missing dependencies di useEffect
    }
  }
];

export default eslintConfig;
