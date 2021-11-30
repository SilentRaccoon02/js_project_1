const axios = require('axios');
const cheerio = require('cheerio');

const tools = require('./tools.js');
const week = require('./week.js');


const headers = {
    'Accept-Language': 'ru'
};


async function write() {
    const main_part = 'https://timetable.spbu.ru/AMCP/StudentGroupEvents/Primary';
    const groups = [
        '303083',
        '303077',
        '303069'
    ];
    const dates = [
        '2021-08-30',
        '2021-09-06',
        '2021-09-13',
        '2021-09-20',
        '2021-09-27',
        '2021-10-04',
        '2021-10-11',
        '2021-10-18',
        '2021-10-25',
        '2021-11-01',
        '2021-11-08',
        '2021-11-15',
        '2021-11-22',
        '2021-11-29'
    ];

    console.log('creating urls...');
    let start = new Date().getTime();

    let urls = [];
    groups.forEach(group_item => {
        dates.forEach(date_item => {
            urls.push(`${main_part}/${group_item}/${date_item}`);
        });
    });

    let end = new Date().getTime();
    console.log(`creating urls complete -> ${end - start}ms`);


    console.log('\npage requests...');
    start = new Date().getTime();

    let requests = urls.map(url => axios.get(url, {headers: headers}));
    let pages = await Promise.all(requests);

    end = new Date().getTime();
    console.log(`page requests complete -> ${end - start}ms`);


    console.log('\nwriting...');
    start = new Date().getTime();

    for (const item of pages) {
        let data = cheerio.load(item.data);
        let new_week = new week.Week('page', data);
        await new_week.write();
    }

    end = new Date().getTime();
    console.log(`writing complete -> ${end - start}ms`);
}

async function read() {
    let week_date = '2021-11-22';
    let group_name = '20.Б07-пу';

    if (await tools.check_existence(week_date, group_name)) {
        let db_data = await tools.read_data(week_date, group_name);
        let new_week = new week.Week('db', db_data);
        console.log(new_week.get_string());
    } else {
        console.log('Данных не существует');
    }
}

//write().then();
read().then();
