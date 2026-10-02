from supabase import create_client, Client
from app.config import settings

_client: Client = None


def get_supabase() -> Client:
    """Return a Supabase client instance, lazily initialized."""
    global _client
    if _client is None:
        if not settings.supabase_url or not settings.supabase_key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be configured in environment.")
        _client = create_client(settings.supabase_url, settings.supabase_key)
    return _client


class _SupabaseProxy:
    """Lazy proxy so module import does not crash before environment is ready."""
    def __getattr__(self, name):
        return getattr(get_supabase(), name)


# Module-level lazy proxy
supabase: Client = _SupabaseProxy()
