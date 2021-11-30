const {Client} = require('pg');

const client_settings = {
    user: 'postgres',
    host: '127.0.0.1',
    database: 'timetable',
    password: 'root',
    port: '5432',
};

function calc_time_code(str) {
    let start_time = str.split('–')[0];
    let time_parts = start_time.split(':');
    let hours = time_parts[0];
    let minutes = time_parts[1];

    return Number(hours) * 60 + Number(minutes);
}

function calc_date(str) {
    let months = [
        'января',
        'февраля',
        'марта',
        'апреля',
        'мая',
        'июня',
        'июля',
        'августа',
        'сентября',
        'октября',
        'ноября',
        'декабря'
    ];

    let year = new Date().getFullYear();
    let day_and_months = str.split(' ');

    let day = day_and_months[0];
    let month = months.indexOf(day_and_months[1]) + 1;

    return `${year}-${month}-${day}`;
}

async function check_existence(week_date, group_name) {
    const client = new Client(client_settings);
    client.connect();

    const check = {
        text: 'SELECT\n' +
            'COUNT(week_date_id) FROM weeks\n' +
            'WHERE weeks.week_date_id = (SELECT week_date_id FROM week_dates WHERE week_date LIKE $1) \n' +
            'AND weeks.group_name_id = (SELECT group_name_id FROM group_names WHERE group_name = $2)',
        values: [week_date + '%', group_name]
    };

    let check_result = await client.query(check);

    let result = false;
    if (check_result.rows[0]['count'] > 0) {
        result = true;
    }

    client.end();

    return result;
}

async function read_data(week_date, group_name) {
    const client = new Client(client_settings);
    client.connect();

    const query = {
        text: 'SELECT\n' +
            'class_times.class_time_code,\n' +
            'class_times.class_time,\n' +
            'day_dates.day_date,\n' +
            'day_names.day_name_id,\n' +
            'day_names.day_name,\n' +
            'subject_names.subject_name,\n' +
            'lecturer_names.lecturer_name,\n' +
            'location_names.location_name\n' +
            'FROM weeks\n' +
            'JOIN days ON days.week_day_id = weeks.week_day_id\n' +
            'JOIN day_names ON day_names.day_name_id = days.day_name_id\n' +
            'JOIN day_dates ON day_dates.day_date_id = days.day_date_id\n' +
            'JOIN subjects ON subjects.day_subject_id = days.day_subject_id\n' +
            'JOIN class_times ON class_times.class_time_id = subjects.class_time_id\n' +
            'JOIN subject_names ON subject_names.subject_name_id = subjects.subject_name_id\n' +
            'JOIN lecturer_names ON lecturer_names.lecturer_name_id = subjects.lecturer_name_id\n' +
            'JOIN location_names On location_names.location_name_id = subjects.location_name_id\n' +
            'WHERE weeks.week_date_id = (SELECT week_date_id FROM week_dates WHERE week_date LIKE $1) \n' +
            'AND weeks.group_name_id = (SELECT group_name_id FROM group_names WHERE group_name = $2)\n' +
            'ORDER BY days.day_name_id, class_times.class_time_code',

        values: [week_date + '%', group_name]
    };

    let data = await client.query(query);
    client.end();

    return data;
}

module.exports = {
    client_settings: client_settings,
    calc_time_code: calc_time_code,
    calc_date: calc_date,
    check_existence: check_existence,
    read_data: read_data
};
