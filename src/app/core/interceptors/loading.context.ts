import { HttpContextToken } from '@angular/common/http';

/** Opt in to the full-page loader for a request. Off by default — forms use button spinners instead. */
export const SHOW_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);
