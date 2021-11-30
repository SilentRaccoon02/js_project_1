SELECT
class_times.class_time_code,
class_times.class_time,
day_dates.day_date,
day_names.day_name_id,
day_names.day_name,
subject_names.subject_name,
lecturer_names.lecturer_name,
location_names.location_name
FROM weeks
JOIN days ON days.week_day_id = weeks.week_day_id
JOIN day_names ON day_names.day_name_id = days.day_name_id
JOIN day_dates ON day_dates.day_date_id = days.day_date_id
JOIN subjects ON subjects.day_subject_id = days.day_subject_id
JOIN class_times ON class_times.class_time_id = subjects.class_time_id
JOIN subject_names ON subject_names.subject_name_id = subjects.subject_name_id
JOIN lecturer_names ON lecturer_names.lecturer_name_id = subjects.lecturer_name_id
JOIN location_names On location_names.location_name_id = subjects.location_name_id
WHERE weeks.week_date_id = (SELECT week_date_id FROM week_dates WHERE week_date LIKE '2021-11-22%') 
AND weeks.group_name_id = (SELECT group_name_id FROM group_names WHERE group_name = '20.Б07-пу')
ORDER BY days.day_name_id, class_times.class_time_code
