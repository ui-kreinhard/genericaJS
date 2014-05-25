-- View: schema_and_translation

DROP VIEW schema_and_translation;

CREATE OR REPLACE VIEW schema_and_translation AS 
 SELECT c.table_name,
    c.column_name AS field,
    c.character_maximum_length AS textlength,
    COALESCE((( SELECT c.data_type
          WHERE mappings.table_name IS NULL))::character varying, 'combobox'::character varying) AS data_type,
    ( SELECT string_agg(rel_mapping_readout.value::text, ','::text) AS string_agg
           FROM rel_mapping_readout(COALESCE(mappings.table_name::character varying, 'dummy_rel'::character varying)::regclass) rel_mapping_readout(id, value, label)) AS valuescombobox,
    ( SELECT string_agg(rel_mapping_readout.label::text, ','::text) AS string_agg
           FROM rel_mapping_readout(COALESCE(mappings.table_name::character varying, 'dummy_rel'::character varying)::regclass) rel_mapping_readout(id, value, label)) AS labels,
 
    COALESCE(trl.translation, c.column_name::character varying) AS "displayName",
    true AS visible
   FROM tables t
   JOIN information_schema.columns c ON t.table_name::text = c.table_name::text AND c.table_catalog::name = current_database()
   LEFT JOIN formelements_order feo ON feo.table_name::text = t.table_name::text AND feo.column_name::text = c.column_name::text
   LEFT JOIN tables mappings ON mappings.table_name::text = (((t.table_name::text || '_'::text) || c.column_name::text) || '_rel_mapping'::text)
   LEFT JOIN translations trl ON trl.table_name = t.table_name::bpchar AND trl.column_name::text = c.column_name::text AND (EXISTS ( SELECT 1
   FROM user_language
 WHERE user_language.username::name = "current_user"() and trl.language_id = user_language.language_id))
  ORDER BY t.table_name, feo.id;

ALTER TABLE schema_and_translation
  OWNER TO postgres;

