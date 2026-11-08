import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://bakgzheahfsqouuyxrfm.supabase.co";
const SUPABASE_KEY = "sb_publishable_i7DSHIdzAPiTOjuhQtLdrQ_jj5QuGQ9";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);