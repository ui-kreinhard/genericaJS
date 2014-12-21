 SELECT to_insert.date_start,
    to_insert.date_end
   FROM ( SELECT min(bb.timestamptz) AS date_start,
            max(bb.timestamptz) AS date_end,
            bb.timestamptz::date AS timestamptz
           FROM ( SELECT st_distance(st_point(8.70047::double precision, 49.03172::double precision)::geography, cc.coordinate::geography, false) AS dist,
                    cc.timestamptz
                   FROM ( SELECT st_point(split_part(aa.coordinate_xml::text, ' '::text, 1)::double precision, split_part(aa.coordinate_xml::text, ' '::text, 2)::double precision) AS coordinate,
                            aa.timestamptz_xml::timestamp with time zone AS timestamptz
                           FROM ( SELECT unnest(xpath('//gx:Track/kml:when/text()'::text, imp3.raw_kml, ARRAY[ARRAY['gx'::text, 'http://www.google.com/kml/ext/2.2'::text], ARRAY['kml'::text, 'http://www.opengis.net/kml/2.2'::text]]))::character varying AS timestamptz_xml,
                                    unnest(xpath('//gx:Track/gx:coord/text()'::text, imp3.raw_kml, ARRAY[ARRAY['gx'::text, 'http://www.google.com/kml/ext/2.2'::text]]))::character varying AS coordinate_xml
                                   FROM worktimes.worktimes_kml_import imp3) aa) cc) bb
          WHERE bb.dist <= 70::double precision
          GROUP BY bb.timestamptz::date
          ORDER BY bb.timestamptz::date) to_insert
  WHERE NOT (EXISTS ( SELECT 1
           FROM worktimes.worktimes w
          WHERE w.date_start::date = to_insert.date_start::date));

