const tools = require('./tools.js');


function ClassTime(class_time) {
    this.class_time = class_time;
    this.class_time_id = -1;

    this.is_new = false;

    this.write = async function (client) {
        let select_result = await client.query('SELECT class_time_id, class_time FROM class_times WHERE class_time = $1', [this.class_time]);

        if (select_result.rows.length > 0) {
            this.class_time_id = select_result.rows[0]['class_time_id'];
        } else {
            const query = {
                text: 'INSERT INTO class_times(class_time_code, class_time) VALUES ($1, $2) RETURNING class_time_id',
                values: [tools.calc_time_code(this.class_time), this.class_time]
            };

            let insert_result = await client.query(query);
            this.class_time_id = insert_result.rows[0]['class_time_id'];
            this.is_new = true;
        }
    };
}

function SubjectName(subject_name) {
    this.subject_name = subject_name;
    this.subject_name_id = -1;

    this.is_new = false;

    this.write = async function (client) {
        let select_result = await client.query('SELECT subject_name_id, subject_name FROM subject_names WHERE subject_name = $1', [this.subject_name]);

        if (select_result.rows.length > 0) {
            this.subject_name_id = select_result.rows[0]['subject_name_id'];
        } else {
            let insert_result = await client.query('INSERT INTO subject_names(subject_name) VALUES ($1) RETURNING subject_name_id', [this.subject_name]);
            this.subject_name_id = insert_result.rows[0]['subject_name_id'];
            this.is_new = true;
        }
    };
}

function LecturerName(lecturer_name) {
    if (lecturer_name.search(',') !== -1) {
        lecturer_name = 'несколько преподавателей';
    }

    this.lecturer_name = lecturer_name;
    this.lecturer_name_id = -1;

    this.is_new = false;

    this.write = async function (client) {
        let select_result = await client.query('SELECT lecturer_name_id, lecturer_name FROM lecturer_names WHERE lecturer_name = $1', [this.lecturer_name]);

        if (select_result.rows.length > 0) {
            this.lecturer_name_id = select_result.rows[0]['lecturer_name_id'];
        } else {
            let insert_result = await client.query('INSERT INTO lecturer_names(lecturer_name) VALUES ($1) RETURNING lecturer_name_id', [this.lecturer_name]);
            this.lecturer_name_id = insert_result.rows[0]['lecturer_name_id'];
            this.is_new = true;
        }
    };
}

function LocationName(location_name) {
    this.location_name = location_name;
    this.location_name_id = -1;

    this.is_new = false;

    this.write = async function (client) {
        let select_result = await client.query('SELECT location_name_id, location_name FROM location_names WHERE location_name = $1', [this.location_name]);

        if (select_result.rows.length > 0) {
            this.location_name_id = select_result.rows[0]['location_name_id'];
        } else {
            let insert_result = await client.query('INSERT INTO location_names(location_name) VALUES ($1) RETURNING location_name_id', [this.location_name]);
            this.location_name_id = insert_result.rows[0]['location_name_id'];
            this.is_new = true;
        }
    };
}

function Subject(task, data, elem = null) {
    if (task === 'page') {
        let $ = data;

        this.class_time = new ClassTime($(elem).find('div.col-sm-2.studyevent-datetime > div > div > span').text().trim());
        this.subject_name = new SubjectName($(elem).find('div.col-sm-4.studyevent-subject').text().trim());
        this.lecturer_name = new LecturerName($(elem).find('div.col-sm-3.studyevent-educators > div > div > span').text().trim());

        let location_name = $(elem).find('div.col-sm-3.studyevent-locations > div > div > span');

        if (location_name.length === 0) {
            location_name = $(elem).find('div.col-sm-3.studyevent-multiple-locations > div > div > span');
        }

        this.location_name = new LocationName(location_name.text().trim());

        this.subject_id = -1;
        this.day_subject_id = -1;
    }

    if (task === 'db') {
        this.class_time = new ClassTime(data['class_time']);
        this.subject_name = new SubjectName(data['subject_name']);
        this.lecturer_name = new LecturerName(data['lecturer_name']);
        this.location_name = new LocationName(data['location_name']);
    }

    this.get_string = function () {
        let location;

        if (this.location_name.location_name === 'С использованием информационно-коммуникационных технологий') {
            location = 'дистанционно';
        } else {
            location = 'очно';
        }

        return `(${this.class_time.class_time}, ${location}) ${this.subject_name.subject_name}, ${this.lecturer_name.lecturer_name}`;
    };

    this.write = async function (client) {
        let is_new = false;

        await Promise.all([
            this.class_time.write(client),
            this.subject_name.write(client),
            this.location_name.write(client),
            this.lecturer_name.write(client)
        ]);

        if (this.class_time.is_new || this.subject_name.is_new || this.location_name.is_new || this.lecturer_name.is_new) {
            is_new = true;
        }

        if (!is_new) {
            const query = {
                text: 'SELECT subject_id, day_subject_id FROM subjects WHERE class_time_id = $1 AND subject_name_id = $2 AND lecturer_name_id = $3 AND location_name_id = $4',
                values: [this.class_time.class_time_id, this.subject_name.subject_name_id,
                    this.location_name.location_name_id, this.lecturer_name.lecturer_name_id]
            };

            let select_result = await client.query(query);

            if (select_result.rows.length > 0) {
                this.subject_id = select_result.rows[0]['subject_id'];
                this.day_subject_id = select_result.rows[0]['day_subject_id'];
            }
        }
    };
}

module.exports.Subject = Subject;
