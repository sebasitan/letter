-- ============================================================
-- Ever Yours - repoint stored image paths at the WebP versions
-- Run in Supabase: SQL Editor -> New query -> paste -> Run
--
-- WHY: the site's images were 2-3 MB PNGs - 109 MB in total, with a
-- 2.4 MB hero. On a phone on mobile data that is several seconds of
-- blank screen before anything appears, which is the most expensive
-- kind of slow: it costs you the visitor before they see the product.
--
-- The files are now WebP at the same dimensions (roughly a tenth of the
-- size, no visible quality loss). Catalog rows still point at the old
-- .png names, so they need repointing or their images 404.
--
-- Only the extension changes. Any image you uploaded elsewhere - a full
-- http(s) URL - is left alone.
--
-- Safe to re-run: rows already ending in .webp are not matched.
-- ============================================================

update public.letter_types
   set image = regexp_replace(image, '\.(png|jpg|jpeg)$', '.webp', 'i')
 where image is not null
   and image !~* '^https?://'
   and image ~* '\.(png|jpg|jpeg)$';

update public.gifts
   set image = regexp_replace(image, '\.(png|jpg|jpeg)$', '.webp', 'i')
 where image is not null
   and image !~* '^https?://'
   and image ~* '\.(png|jpg|jpeg)$';


-- ============================================================
-- VERIFY - both rows should say OK
-- ============================================================
select 'letter images repointed' as check,
       case when not exists (
              select 1 from public.letter_types
               where image is not null and image !~* '^https?://'
                 and image ~* '\.(png|jpg|jpeg)$')
            then 'OK' else 'FAIL - some rows still point at .png' end as result
union all
select 'gift images repointed',
       case when not exists (
              select 1 from public.gifts
               where image is not null and image !~* '^https?://'
                 and image ~* '\.(png|jpg|jpeg)$')
            then 'OK' else 'FAIL - some rows still point at .png' end;
