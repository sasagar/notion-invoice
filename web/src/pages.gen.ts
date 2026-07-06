// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages, GetConfigResponse, SearchCodecsForPages } from 'waku/router';

// prettier-ignore
import type { getConfig as File_Index_getConfig } from './pages/index';
// prettier-ignore
import type { getConfig as File_InvoiceItemSlugEdit_getConfig } from './pages/invoice/item/[slug]/edit';
// prettier-ignore
import type { getConfig as File_InvoiceItemSlug_getConfig } from './pages/invoice/item/[slug]';
// prettier-ignore
import type { getConfig as File_InvoiceListPage_getConfig } from './pages/invoice/list/[page]';
// prettier-ignore
import type { getConfig as File_InvoiceNew_getConfig } from './pages/invoice/new';
// prettier-ignore
import type { getConfig as File_Login_getConfig } from './pages/login';
// prettier-ignore
import type { getConfig as File_MastersAccountsId_getConfig } from './pages/masters/accounts/[id]';
// prettier-ignore
import type { getConfig as File_MastersAccounts_getConfig } from './pages/masters/accounts';
// prettier-ignore
import type { getConfig as File_MastersCustomersId_getConfig } from './pages/masters/customers/[id]';
// prettier-ignore
import type { getConfig as File_MastersCustomers_getConfig } from './pages/masters/customers';
// prettier-ignore
import type { getConfig as File_MastersIndex_getConfig } from './pages/masters/index';
// prettier-ignore
import type { getConfig as File_MastersItemsId_getConfig } from './pages/masters/items/[id]';
// prettier-ignore
import type { getConfig as File_MastersItems_getConfig } from './pages/masters/items';
// prettier-ignore
import type { getConfig as File_User_getConfig } from './pages/user';

// prettier-ignore
type Page =
| ({ path: '/' } & GetConfigResponse<typeof File_Index_getConfig>)
| ({ path: '/invoice/item/[slug]/edit' } & GetConfigResponse<typeof File_InvoiceItemSlugEdit_getConfig>)
| ({ path: '/invoice/item/[slug]' } & GetConfigResponse<typeof File_InvoiceItemSlug_getConfig>)
| ({ path: '/invoice/list/[page]' } & GetConfigResponse<typeof File_InvoiceListPage_getConfig>)
| ({ path: '/invoice/new' } & GetConfigResponse<typeof File_InvoiceNew_getConfig>)
| ({ path: '/login' } & GetConfigResponse<typeof File_Login_getConfig>)
| ({ path: '/masters/accounts/[id]' } & GetConfigResponse<typeof File_MastersAccountsId_getConfig>)
| ({ path: '/masters/accounts' } & GetConfigResponse<typeof File_MastersAccounts_getConfig>)
| ({ path: '/masters/customers/[id]' } & GetConfigResponse<typeof File_MastersCustomersId_getConfig>)
| ({ path: '/masters/customers' } & GetConfigResponse<typeof File_MastersCustomers_getConfig>)
| ({ path: '/masters' } & GetConfigResponse<typeof File_MastersIndex_getConfig>)
| ({ path: '/masters/items/[id]' } & GetConfigResponse<typeof File_MastersItemsId_getConfig>)
| ({ path: '/masters/items' } & GetConfigResponse<typeof File_MastersItems_getConfig>)
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
