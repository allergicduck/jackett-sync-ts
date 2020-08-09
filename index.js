#!/bin/env node

const { Command } = require("commander");
const services = require("./services.js");

const program = new Command();

program
// .option("-k, --apikey <key>", "Jackett API Key")
// .option("-u, --url <url>", "Jackett URL", "http://127.0.0.1:9117")
// .option("-au, --alturl <url>", "Alternative Jackett URI (for use when adding to sevices, default = --uri)")
// .option("-su, --sonarrurl <url>", "Sonnar URL", "http://127.0.0.1:8989")
// .option("-sk, --sonarrkey <key>", "Sonnar API Key")

for (const i in services) {
	const service = services[i];

	for (const j in service.params) {
		const param = service.params[j];

		program.option(`--${param} <${param}>`, "", service.defaults && service.defaults[j] ? service.defaults[j] : undefined);
	}
}

program.parse(process.argv);

function findServices() {
	const readyServices = {};
	for (const i in services) {
		const service = services[i];

		if (service.required) {
			let flag = true;

			for (const j in service.required) {
				if (!program[service.required[j]]) {
					flag = false;
				}
			}

			if (flag) {
				readyServices[i] = service;
			}
		} else {
			readyServices[i] = service;
		}
	}

	return readyServices;
}

function serviceParams(service) {
	const params = []

	service.params.forEach((el, i) => {
		let val = program[el];
		if (service.process && service.process[i])
			val = service.process[i](val);
		params.push(val);
	});

	return params;
}

async function sync(service, to) {
	// await service.sync(...serviceParams(service), jackettIndexers);

	try {
		const params = serviceParams(service);

		const indexers = (await service.get(...params)).filter(el => el.id);

		const idList = indexers.map(el => el.id);

		const promises = [];
		const toAddIds = [];

		to.filter(el => !idList.includes(el.id))
			.filter(el => service.shouldAdd(...params, el))
			.forEach(el => {
				toAddIds.push(el.id);
				promises.push(service.add(...params, el));
			});

		if (toAddIds.length > 0) {
			console.log(`Adding ${toAddIds.join(', ')}`);
		} else {
			console.log("Nothing do add");
		}
		await Promise.all(promises);
	} catch (e) {
		console.error(e);
	}	
}

(async () => {
	try {
		const readyServices = findServices();

		const sources = Object.values(readyServices).filter(el => el.source);
		const indexers = (await Promise.all(sources.map(async el => await el.get(...serviceParams(el))))).reduce((result,i) => result.concat(i), []);

		// console.log(indexers)

		const promises = [];

		Object.keys(readyServices).forEach(async name => {
			const service = services[name];
			console.log(`Found config for ${name}`)
			if (!service.source && service.add && service.shouldAdd) {
				promises.push(sync(service, indexers));
			}
		})

		await Promise.all(promises);
		console.log("Done");
	} catch (e) {
		console.error(e);
	}
})()
