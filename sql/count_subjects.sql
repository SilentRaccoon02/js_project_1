SELECT lecturer_names.lecturer_name_id, lecturer_names.lecturer_name, count_n.n
FROM
(SELECT
lecturer_names.lecturer_name_id,
COUNT (lecturer_names.lecturer_name_id) AS n
FROM lecturer_names
JOIN subjects ON subjects.lecturer_name_id = lecturer_names.lecturer_name_id
GROUP BY lecturer_names.lecturer_name_id) AS count_n
JOIN lecturer_names ON lecturer_names.lecturer_name_id = count_n.lecturer_name_id
ORDER BY n DESC
