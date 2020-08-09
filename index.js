//http://127.0.0.1:9117/jackett/api/v2.0/indexers/all/results/torznab/api?apikey=sen08b96xf8x1o3twv9n1aml8da8p7mp&t=indexers&configured=true

const { Command } = require("commander");
const axios = require("axios");
const parser = require("xml2json");

const util = require("util");

const services = require("./services.js");
const { read } = require("fs");

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

// const serviceParams;

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

	service.params.forEach(el => {
		params.push(program[el]);
	});

	return params;
}

async function sync(service, jackettIndexers) {
	await service.sync(...serviceParams(service), jackettIndexers);
}

(async () => {
	try {
		const jackettIndexers = await services.jackett.get(...serviceParams(services.jackett));

		const promises = [];

		Object.keys(findServices()).forEach(async name => {
			const service = services[name];
			if (service.sync) {
				console.log(`Found valid config for ${name}`)
				promises.push(sync(service, jackettIndexers));
			}
		})

		await Promise.all(promises);
		console.log("Done");
	} catch (e) {
		console.error(e);
	}
})()
