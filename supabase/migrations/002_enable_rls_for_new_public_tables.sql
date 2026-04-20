-- Automatically enable RLS for all newly created tables in public schema.
create or replace function public.enable_rls_on_new_public_tables()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  obj record;
begin
  for obj in
    select
      command_tag,
      object_identity,
      schema_name,
      object_type
    from pg_event_trigger_ddl_commands()
  loop
    if obj.command_tag = 'CREATE TABLE'
      and obj.object_type = 'table'
      and obj.schema_name = 'public'
    then
      execute format('alter table %s enable row level security', obj.object_identity);
    end if;
  end loop;
end;
$$;

drop event trigger if exists trg_enable_rls_on_new_public_tables;
create event trigger trg_enable_rls_on_new_public_tables
  on ddl_command_end
  when tag in ('CREATE TABLE')
  execute function public.enable_rls_on_new_public_tables();
