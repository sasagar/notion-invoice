// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages, GetConfigResponse, SearchCodecsForPages } from 'waku/router';

// prettier-ignore
import type { getConfig as File_Index_getConfig } from './pages/index';
// prettier-ignore
import type { getConfig as File_InvoiceItemSlug_getConfig } from './pages/invoice/item/[slug]';
// prettier-ignore
import type { getConfig as File_InvoiceListPage_getConfig } from './pages/invoice/list/[page]';
// prettier-ignore
import type { getConfig as File_Login_getConfig } from './pages/login';
// prettier-ignore
import type { getConfig as File_User_getConfig } from './pages/user';

// prettier-ignore
type Page =
| ({ path: '/' } & GetConfigResponse<typeof File_Index_getConfig>)
| ({ path: '/invoice/item/[slug]' } & GetConfigResponse<typeof File_InvoiceItemSlug_getConfig>)
| ({ path: '/invoice/list/[page]' } & GetConfigResponse<typeof File_InvoiceListPage_getConfig>)
| ({ path: '/login' } & GetConfigResponse<typeof File_Login_getConfig>)
| ({ path: '/user' } & GetConfigResponse<typeof File_User_getConfig>);

// prettier-ignore
type Layout =
| { path: '/' };

// prettier-ignore
declare module 'waku/router' {
  interface RouteConfig {
    paths: PathsForPages<Page>;
  }
  interface CreatePagesConfig {
    pages: Page;
    layouts: Layout;
  }
  interface SearchCodecsConfig extends SearchCodecsForPages<Page> {}
}
