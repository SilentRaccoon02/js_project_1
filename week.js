const {Client} = require('pg');

const tools = require('./tools.js');
const day = require('./day');


function WeekDate(week_date) {
    let start_and_end = week_date.split(' – ');

    this.week_date = `${tools.calc_date(start_and_end[0])}-${tools.calc_date(start_and_end[1])}`;
    this.week_date_id = -1;

    this.write = async function (client) {
        let select_result = await client.query('SELECT week_date_id, week_date FROM week_dates WHERE week_date = $1', [this.week_date]);

        if (select_result.rows.length > 0) {
            this.week_date_id = select_result.rows[0]['week_date_id'];
        } else {
            let insert_result = await client.query('INSERT INTO week_dates(week_date) VALUES ($1) RETURNING week_date_id', [this.week_date]);
            this.week_date_id = insert_result.rows[0]['week_date_id'];
        }
    };
}

function GroupName(group_name) {
    this.group_name = group_name;
    this.group_name_id = -1;

    this.write = async function (client) {
        let select_result = await client.query('SELECT group_name_id, group_name FROM group_names WHERE group_name = $1', [this.group_name]);

        if (select_result.rows.length > 0) {
            this.group_name_id = select_result.rows[0]['group_name_id'];
        } else {
            let insert_result = await client.query('INSERT INTO group_names(group_name) VALUES ($1) RETURNING group_name_id', [this.group_name]);
            this.group_name_id = insert_result.rows[0]['group_name_id'];
        }
    };
}

function Week(task, data) {
    if (task === 'page') {
        let $ = data;

        this.week_date = new WeekDate($('#week > span').text());
        this.group_name = new GroupName($('body > div > div.container > div > div.col-sm-7 > h2').text().split(' ')[1]);

        this.week_days = [];
        $('#accordion > div').each((i, item) => {
            this.week_days.push(new day.Day('page', $, item));
        });

        this.week_day_id = -1;
    }

    if (task === 'db') {
        this.week_days = [];

        let day_name_id = data.rows[0]['day_name_id'];
        let new_day = [];
        data.rows.forEach(item => {
            if (item['day_name_id'] === day_name_id) {
                new_day.push(item);
            } else {
                this.week_days.push(new day.Day('db', new_day));

                day_name_id = item['day_name_id'];
                new_day.length = 0;
                new_day.push(item);
            }
        });

        this.week_days.push(new day.Day('db', new_day));
    }

    this.get_string = function () {
        let out = '';
        if (this.group_name !== undefined && this.week_date !== undefined) {
            out = `${this.group_name.group_name}, ${this.week_date.week_date}\n\n`;
        }

        this.week_days.forEach(item => {
            out += `${item.get_string()}\n`;
        });

        return out.substring(0, out.length - 2);
    };

    this.write = async function () {
        const client = new Client(tools.client_settings);
        client.connect();

        if (await tools.check_existence(this.week_date.week_date, this.group_name.group_name)) {
            console.log(`Couple exist: ${this.week_date.week_date} ${this.group_name.group_name}`);
            client.end();
            return;
        }

        await client.query('');

        await Promise.all([
            this.week_date.write(client),
            this.group_name.write(client)
        ]);

        for (let i = 0; i < this.week_days.length; i++) {
            await this.week_days[i].write(client);
        }

        let insert_result = await client.query('INSERT INTO week_day_ids(week_day_id) VALUES (DEFAULT) RETURNING week_day_id');
        this.week_day_id = insert_result.rows[0]['week_day_id'];

        const query = {
            text: 'INSERT INTO weeks(week_date_id, group_name_id, week_day_id) VALUES($1, $2, $3)',
            values: [this.week_date.week_date_id, this.group_name.group_name_id, this.week_day_id]
        };

        await client.query(query);

        await Promise.all(this.week_days.map(async item => {
            const query = {
                text: 'INSERT INTO days(day_name_id, day_date_id, day_subject_id, week_day_id) VALUES ($1, $2, $3, $4)',
                values: [item.day_name.day_name_id, item.day_date.day_date_id, item.day_subject_id, this.week_day_id]
            };

            await client.query(query);
        }));

        client.end();
    };
}

module.exports.Week = Week;
