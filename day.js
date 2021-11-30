const {Client} = require('pg');

const tools = require('./tools.js');
const subject = require('./subject.js');


function DayName(day_name) {
    this.day_name = day_name;
    this.day_name_id = -1;

    this.write = async function (client) {
        let select_result = await client.query('SELECT day_name_id, day_name FROM day_names WHERE day_name = $1', [this.day_name]);

        // AUTO day_names ADD
        // if (select_result.rows.length > 0) {
        //     this.day_name_id = select_result.rows[0]['day_name_id'];
        // } else {
        //     let insert_result = await client.query('INSERT INTO day_names(day_name) VALUES ($1) RETURNING day_name_id', [this.day_name]);
        //     this.day_name_id = insert_result.rows[0]['day_name_id'];
        // }

        // DELETE IF AUTO
        this.day_name_id = select_result.rows[0]['day_name_id'];
    };
}

function DayDate(day_date) {
    this.day_date = day_date;
    this.day_date_id = -1;

    this.write = async function (client) {
        let select_result = await client.query('SELECT day_date_id, day_date FROM day_dates WHERE day_date = $1', [this.day_date]);

        if (select_result.rows.length > 0) {
            this.day_date_id = select_result.rows[0]['day_date_id'];
        } else {
            let insert_result = await client.query('INSERT INTO day_dates(day_date) VALUES ($1) RETURNING day_date_id', [this.day_date]);
            this.day_date_id = insert_result.rows[0]['day_date_id'];
        }
    };
}


function Day(task, data, elem) {
    if (task === 'page') {
        let $ = data;

        let day_and_date = $(elem).find('h4').text().trim().split(', ');

        this.day_name = new DayName(day_and_date[0]);
        this.day_date = new DayDate(tools.calc_date(day_and_date[1]));

        this.day_subjects = [];
        $(elem).find('ul > li').each((i, elem) => {
            this.day_subjects.push(new subject.Subject('page', $, elem));
        });

        this.day_subject_id = -1;
    }

    if (task === 'db') {
        this.day_name = new DayName(data[0]['day_name']);
        this.day_date = new DayDate(data[0]['day_date']);

        this.day_subjects = [];
        data.forEach(item => {
            this.day_subjects.push(new subject.Subject('db', item));
        });
    }

    this.get_string = function () {
        let out = `${this.day_name.day_name}, ${this.day_date.day_date}\n`;

        this.day_subjects.forEach(item => {
            out += `${item.get_string()}\n`;
        });

        return out;
    };

    this.write = async function (client) {
        await Promise.all([
            this.day_name.write(client),
            this.day_date.write(client)
        ]);

        let is_new = false;

        for (let i = 0; i < this.day_subjects.length; i++) {
            await this.day_subjects[i].write(client);
        }

        this.day_subjects.forEach((item) => {
            if (item.subject_id === -1 || item.day_subject_id !== this.day_subjects[0].day_subject_id) {
                is_new = true;
            }
        });

        if (!is_new) {
            let count_result = await client.query('SELECT COUNT(class_time_id) FROM subjects WHERE day_subject_id = $1', [this.day_subject_id]);
            if (this.day_subjects.length !== count_result.rows[0]['count']) {
                is_new = true;
            }
        }

        if (is_new) {
            let insert_result = await client.query('INSERT INTO day_subject_ids(day_subject_id) VALUES (DEFAULT) RETURNING day_subject_id');
            this.day_subject_id = insert_result.rows[0]['day_subject_id'];

            await Promise.all(this.day_subjects.map(async item => {
                const query = {
                    text: 'INSERT INTO subjects(class_time_id, subject_name_id, lecturer_name_id, location_name_id, day_subject_id) VALUES ($1, $2, $3, $4, $5)',
                    values: [item.class_time.class_time_id, item.subject_name.subject_name_id,
                        item.lecturer_name.lecturer_name_id, item.location_name.location_name_id,
                        this.day_subject_id]
                };

                await client.query(query);
            }));
        }
    };
}

module.exports.Day = Day;
