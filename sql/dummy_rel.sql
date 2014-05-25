-- Function: rel_mapping_readout(regclass)

-- DROP FUNCTION rel_mapping_readout(regclass);

CREATE OR REPLACE FUNCTION rel_mapping_readout(IN tablename regclass)
  RETURNS TABLE(id integer, value integer, label character varying) AS
$BODY$
BEGIN
RETURN QUERY EXECUTE format('SELECT id, value, label FROM %s ', tableName);
END
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION rel_mapping_readout(regclass)
  OWNER TO postgres;


