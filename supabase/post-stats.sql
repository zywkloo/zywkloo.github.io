create table if not exists public.post_stats (
	slug text primary key,
	view_count bigint not null default 0,
	like_count bigint not null default 0,
	updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.post_view_events (
	slug text not null,
	visitor_id text not null,
	viewed_on date not null default (timezone('utc', now())::date),
	created_at timestamptz not null default timezone('utc', now()),
	primary key (slug, visitor_id, viewed_on)
);

alter table public.post_stats enable row level security;
alter table public.post_view_events enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.post_stats to anon, authenticated;

drop policy if exists "Public can read post stats" on public.post_stats;
create policy "Public can read post stats"
	on public.post_stats
	for select
	to anon, authenticated
	using (true);

create or replace function public.record_post_view(p_slug text, p_visitor_id text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
	inserted_rows integer;
	current_views bigint;
begin
	if coalesce(length(trim(p_slug)), 0) = 0 then
		raise exception 'p_slug must not be empty';
	end if;

	if coalesce(length(trim(p_visitor_id)), 0) = 0 then
		raise exception 'p_visitor_id must not be empty';
	end if;

	insert into public.post_view_events (slug, visitor_id)
	values (trim(p_slug), trim(p_visitor_id))
	on conflict do nothing;

	get diagnostics inserted_rows = row_count;

	insert into public.post_stats (slug, view_count, like_count, updated_at)
	values (
		trim(p_slug),
		case when inserted_rows > 0 then 1 else 0 end,
		0,
		timezone('utc', now())
	)
	on conflict (slug) do update
	set
		view_count = public.post_stats.view_count + case when inserted_rows > 0 then 1 else 0 end,
		updated_at = timezone('utc', now());

	select view_count
	into current_views
	from public.post_stats
	where slug = trim(p_slug);

	return current_views;
end;
$$;

grant execute on function public.record_post_view(text, text) to anon, authenticated;
