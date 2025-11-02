create or replace function get_user_network(user_id uuid, max_depth int)
returns table (
  connection_id uuid,
  user_a_id uuid,
  user_b_id uuid,
  user_a_name text,
  user_b_name text,
  depth int
)
language plpgsql
as $$
begin
  return query
  with recursive network as (
    -- Base case: direct connections (depth 1)
    select 
      m.id as connection_id,
      m.user_a_id,
      m.user_b_id,
      ua.name as user_a_name,
      ub.name as user_b_name,
      1 as depth
    from matches m
    join users ua on ua.id = m.user_a_id
    join users ub on ub.id = m.user_b_id
    where m.user_a_id = user_id or m.user_b_id = user_id

    union

    -- Recursive case: connections of connections
    select 
      m.id,
      m.user_a_id,
      m.user_b_id,
      ua.name,
      ub.name,
      n.depth + 1
    from matches m
    join users ua on ua.id = m.user_a_id
    join users ub on ub.id = m.user_b_id
    join network n on 
      (m.user_a_id = n.user_a_id or m.user_a_id = n.user_b_id or
       m.user_b_id = n.user_a_id or m.user_b_id = n.user_b_id)
    where 
      n.depth < max_depth and
      m.id != n.connection_id -- Avoid duplicates
  )
  select distinct * from network;
end;
$$;