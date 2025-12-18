// Source - https://stackoverflow.com/a/78706043
// Posted by Menial Orchestra
// Retrieved 2025-12-18, License - CC BY-SA 4.0

interface ImportMetaEnv {
  readonly VITE_YOUR_URL: string;
  readonly VITE_REALM: string;
  readonly VITE_CLIENT_ID: string;
 
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
